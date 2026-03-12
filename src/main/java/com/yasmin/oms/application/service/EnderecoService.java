package com.yasmin.oms.application.service;

import com.yasmin.oms.api.dto.request.EnderecoRequest;
import com.yasmin.oms.api.dto.response.EnderecoResponse;
import com.yasmin.oms.api.exception.ResourceNotFoundException;
import com.yasmin.oms.domain.model.Endereco;
import com.yasmin.oms.domain.model.Usuario;
import com.yasmin.oms.domain.repository.EnderecoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnderecoService {

    private final EnderecoRepository enderecoRepository;
    private final UsuarioService usuarioService;

    @Transactional(readOnly = true)
    public List<EnderecoResponse> listarPorUsuario(UUID usuarioId) {
        usuarioService.buscarPorId(usuarioId); // valida se usuário existe
        return enderecoRepository.findByUsuarioId(usuarioId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EnderecoResponse buscarPorIdEUsuario(UUID enderecoId, UUID usuarioId) {
        Endereco endereco = enderecoRepository.findById(enderecoId)
                .orElseThrow(() -> new ResourceNotFoundException("Endereço", enderecoId));
        if (!endereco.getUsuario().getId().equals(usuarioId)) {
            throw new ResourceNotFoundException("Endereço não pertence ao usuário informado.");
        }
        return toResponse(endereco);
    }

    @Transactional
    public EnderecoResponse criar(UUID usuarioId, EnderecoRequest request) {
        Usuario usuario = usuarioService.buscarEntidadePorId(usuarioId);
        Endereco endereco = new Endereco(usuario, request.getLogradouro(), request.getNumero(),
                request.getBairro(), request.getCidade(), request.getEstado(), request.getCep());
        endereco.setComplemento(request.getComplemento());
        endereco = enderecoRepository.save(endereco);
        return toResponse(endereco);
    }

    @Transactional
    public EnderecoResponse atualizar(UUID usuarioId, UUID enderecoId, EnderecoRequest request) {
        Endereco endereco = enderecoRepository.findById(enderecoId)
                .orElseThrow(() -> new ResourceNotFoundException("Endereço", enderecoId));
        if (!endereco.getUsuario().getId().equals(usuarioId)) {
            throw new ResourceNotFoundException("Endereço não pertence ao usuário informado.");
        }
        endereco.setLogradouro(request.getLogradouro());
        endereco.setNumero(request.getNumero());
        endereco.setComplemento(request.getComplemento());
        endereco.setBairro(request.getBairro());
        endereco.setCidade(request.getCidade());
        endereco.setEstado(request.getEstado());
        endereco.setCep(request.getCep());
        endereco = enderecoRepository.save(endereco);
        return toResponse(endereco);
    }

    @Transactional
    public void excluir(UUID usuarioId, UUID enderecoId) {
        if (!enderecoRepository.existsByIdAndUsuarioId(enderecoId, usuarioId)) {
            throw new ResourceNotFoundException("Endereço não encontrado ou não pertence ao usuário.");
        }
        enderecoRepository.deleteById(enderecoId);
    }

    public Endereco buscarEntidadePorIdEUsuario(UUID enderecoId, UUID usuarioId) {
        Endereco endereco = enderecoRepository.findById(enderecoId)
                .orElseThrow(() -> new ResourceNotFoundException("Endereço", enderecoId));
        if (!endereco.getUsuario().getId().equals(usuarioId)) {
            throw new ResourceNotFoundException("Endereço não pertence ao usuário informado.");
        }
        return endereco;
    }

    private EnderecoResponse toResponse(Endereco endereco) {
        return EnderecoResponse.builder()
                .id(endereco.getId())
                .logradouro(endereco.getLogradouro())
                .numero(endereco.getNumero())
                .complemento(endereco.getComplemento())
                .bairro(endereco.getBairro())
                .cidade(endereco.getCidade())
                .estado(endereco.getEstado())
                .cep(endereco.getCep())
                .build();
    }
}
