package com.yasmin.oms.application.service;

import com.yasmin.oms.api.dto.request.ProdutoRequest;
import com.yasmin.oms.api.dto.request.ProdutoUpdateRequest;
import com.yasmin.oms.api.dto.response.ProdutoResponse;
import com.yasmin.oms.api.exception.BusinessException;
import com.yasmin.oms.api.exception.ResourceNotFoundException;
import com.yasmin.oms.domain.model.Produto;
import com.yasmin.oms.domain.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository produtoRepository;

    @Transactional(readOnly = true)
    public List<ProdutoResponse> listarTodos() {
        return produtoRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProdutoResponse buscarPorId(UUID id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", id));
        return toResponse(produto);
    }

    @Transactional
    public ProdutoResponse criar(ProdutoRequest request) {
        if (request.getSku() != null && !request.getSku().isBlank()
                && produtoRepository.existsBySku(request.getSku())) {
            throw new BusinessException("Já existe um produto com o SKU: " + request.getSku());
        }
        Produto produto = new Produto(request.getNome(), request.getPreco());
        produto.setDescricao(request.getDescricao());
        produto.setEstoque(request.getEstoque() != null ? request.getEstoque() : 0);
        produto.setSku(request.getSku());
        produto = produtoRepository.save(produto);
        return toResponse(produto);
    }

    @Transactional
    public ProdutoResponse atualizar(UUID id, ProdutoUpdateRequest request) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", id));
        if (request.getSku() != null && !request.getSku().isBlank()
                && produtoRepository.existsBySkuAndIdNot(request.getSku(), id)) {
            throw new BusinessException("Já existe outro produto com o SKU: " + request.getSku());
        }
        if (request.getNome() != null) produto.setNome(request.getNome());
        if (request.getDescricao() != null) produto.setDescricao(request.getDescricao());
        if (request.getPreco() != null) produto.setPreco(request.getPreco());
        if (request.getEstoque() != null) {
            if (request.getEstoque() < 0) {
                throw new BusinessException("Estoque não pode ser negativo.");
            }
            produto.setEstoque(request.getEstoque());
        }
        if (request.getSku() != null) produto.setSku(request.getSku());
        produto = produtoRepository.save(produto);
        return toResponse(produto);
    }

    @Transactional
    public void excluir(UUID id) {
        if (!produtoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Produto", id);
        }
        produtoRepository.deleteById(id);
    }

    public Produto buscarEntidadePorId(UUID id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto", id));
    }

    private ProdutoResponse toResponse(Produto produto) {
        return ProdutoResponse.builder()
                .id(produto.getId())
                .nome(produto.getNome())
                .descricao(produto.getDescricao())
                .preco(produto.getPreco())
                .estoque(produto.getEstoque())
                .sku(produto.getSku())
                .dataCadastro(produto.getDataCadastro())
                .build();
    }
}
