package com.yasmin.oms.application.service;

import com.yasmin.oms.api.dto.request.ItemPedidoRequest;
import com.yasmin.oms.api.dto.request.PedidoRequest;
import com.yasmin.oms.api.dto.request.PedidoStatusRequest;
import com.yasmin.oms.api.dto.response.*;
import com.yasmin.oms.api.exception.BusinessException;
import com.yasmin.oms.api.exception.ResourceNotFoundException;
import com.yasmin.oms.config.security.SecurityUtils;
import com.yasmin.oms.domain.model.*;
import com.yasmin.oms.domain.repository.PedidoRepository;
import com.yasmin.oms.domain.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final UsuarioService usuarioService;
    private final EnderecoService enderecoService;
    private final ProdutoRepository produtoRepository;

    private static final List<String> STATUS_VALIDOS = List.of("PENDENTE", "CONFIRMADO", "ENVIADO", "ENTREGUE", "CANCELADO");

    @Transactional(readOnly = true)
    public List<PedidoResponse> listarPorUsuario(UUID usuarioId) {
        usuarioService.buscarPorId(usuarioId);
        return pedidoRepository.findByUsuarioIdOrderByDataPedidoDesc(usuarioId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PedidoResponse> listarTodos() {
        return pedidoRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PedidoResponse buscarPorId(UUID id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", id));
        SecurityUtils.getCurrentUser()
                .filter(p -> p.getRole() == Role.CLIENTE)
                .filter(p -> !pedido.getUsuario().getId().equals(p.getId()))
                .ifPresent(p -> { throw new AccessDeniedException("Acesso negado a este pedido"); });
        return toResponse(pedido);
    }

    @Transactional
    public PedidoResponse criar(PedidoRequest request) {
        Usuario usuario = usuarioService.buscarEntidadePorId(request.getUsuarioId());
        Endereco enderecoCobranca = enderecoService.buscarEntidadePorIdEUsuario(request.getEnderecoCobrancaId(), request.getUsuarioId());
        Endereco enderecoEntrega = enderecoService.buscarEntidadePorIdEUsuario(request.getEnderecoEntregaId(), request.getUsuarioId());

        Pedido pedido = new Pedido(usuario, enderecoCobranca, enderecoEntrega);

        for (ItemPedidoRequest itemReq : request.getItens()) {
            Produto produto = produtoRepository.findById(itemReq.getProdutoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Produto", itemReq.getProdutoId()));
            if (produto.getEstoque() < itemReq.getQuantidade()) {
                throw new BusinessException(
                        "Estoque insuficiente para o produto '" + produto.getNome() + "'. Disponível: " + produto.getEstoque());
            }
            ItemPedido item = new ItemPedido(produto, itemReq.getQuantidade());
            pedido.adicionarItem(item);
        }

        pedido = pedidoRepository.save(pedido);

        // Decrementar estoque após persistir o pedido
        for (ItemPedido item : pedido.getItens()) {
            Produto p = item.getProduto();
            p.setEstoque(p.getEstoque() - item.getQuantidade());
            produtoRepository.save(p);
        }

        return toResponse(pedido);
    }

    @Transactional
    public PedidoResponse atualizarStatus(UUID id, PedidoStatusRequest request) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", id));

        String novoStatus = request.getStatus().toUpperCase();
        if (!STATUS_VALIDOS.contains(novoStatus)) {
            throw new BusinessException("Status inválido. Use: PENDENTE, CONFIRMADO, ENVIADO, ENTREGUE ou CANCELADO.");
        }

        if ("CANCELADO".equals(novoStatus)) {
            if ("ENVIADO".equals(pedido.getStatus()) || "ENTREGUE".equals(pedido.getStatus())) {
                throw new BusinessException("Não é possível cancelar um pedido já enviado ou entregue.");
            }
            // Devolver estoque ao cancelar
            for (ItemPedido item : pedido.getItens()) {
                Produto p = item.getProduto();
                p.setEstoque(p.getEstoque() + item.getQuantidade());
                produtoRepository.save(p);
            }
        }

        pedido.setStatus(novoStatus);
        pedido = pedidoRepository.save(pedido);
        return toResponse(pedido);
    }

    @Transactional(readOnly = true)
    public Pedido buscarEntidadePorId(UUID id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", id));
    }

    private PedidoResponse toResponse(Pedido pedido) {
        List<ItemPedidoResponse> itensResponse = pedido.getItens().stream()
                .map(item -> ItemPedidoResponse.builder()
                        .id(item.getId())
                        .produtoId(item.getProduto().getId())
                        .produtoNome(item.getProduto().getNome())
                        .quantidade(item.getQuantidade())
                        .precoUnitario(item.getPrecoUnitario())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        return PedidoResponse.builder()
                .id(pedido.getId())
                .usuarioId(pedido.getUsuario().getId())
                .usuarioNome(pedido.getUsuario().getNome())
                .enderecoCobranca(enderecoToResponse(pedido.getEnderecoCobranca()))
                .enderecoEntrega(enderecoToResponse(pedido.getEnderecoEntrega()))
                .status(pedido.getStatus())
                .total(pedido.getTotal())
                .dataPedido(pedido.getDataPedido())
                .itens(itensResponse)
                .build();
    }

    private EnderecoResponse enderecoToResponse(Endereco e) {
        return EnderecoResponse.builder()
                .id(e.getId())
                .logradouro(e.getLogradouro())
                .numero(e.getNumero())
                .complemento(e.getComplemento())
                .bairro(e.getBairro())
                .cidade(e.getCidade())
                .estado(e.getEstado())
                .cep(e.getCep())
                .build();
    }
}
