package com.yasmin.oms.application.service;

import com.yasmin.oms.api.dto.request.UsuarioRequest;
import com.yasmin.oms.api.dto.request.UsuarioUpdateRequest;
import com.yasmin.oms.api.dto.response.UsuarioResponse;
import com.yasmin.oms.api.exception.BusinessException;
import com.yasmin.oms.api.exception.ResourceNotFoundException;
import com.yasmin.oms.domain.model.Role;
import com.yasmin.oms.domain.model.Usuario;
import com.yasmin.oms.domain.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UsuarioResponse buscarPorId(UUID id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", id));
        return toResponse(usuario);
    }

    @Transactional
    public UsuarioResponse criar(UsuarioRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Já existe um usuário cadastrado com o email: " + request.getEmail());
        }
        Role role = request.getRole() != null ? request.getRole() : Role.CLIENTE;
        Usuario usuario = new Usuario(request.getNome(), request.getEmail(),
                passwordEncoder.encode(request.getSenha()), role);
        usuario.setTelefone(request.getTelefone());
        usuario.setCpf(request.getCpf());
        usuario = usuarioRepository.save(usuario);
        return toResponse(usuario);
    }

    @Transactional
    public UsuarioResponse atualizar(UUID id, UsuarioUpdateRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", id));
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (usuarioRepository.existsByEmailAndIdNot(request.getEmail(), id)) {
                throw new BusinessException("Já existe outro usuário com o email: " + request.getEmail());
            }
            usuario.setEmail(request.getEmail());
        }
        if (request.getNome() != null) usuario.setNome(request.getNome());
        if (request.getSenha() != null && !request.getSenha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        }
        if (request.getTelefone() != null) usuario.setTelefone(request.getTelefone());
        if (request.getCpf() != null) usuario.setCpf(request.getCpf());
        usuario = usuarioRepository.save(usuario);
        return toResponse(usuario);
    }

    @Transactional
    public void excluir(UUID id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("Usuário", id);
        }
        usuarioRepository.deleteById(id);
    }

    public Usuario buscarEntidadePorId(UUID id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", id));
    }

    private UsuarioResponse toResponse(Usuario usuario) {
        return UsuarioResponse.builder()
                .id(usuario.getId())
                .nome(usuario.getNome())
                .email(usuario.getEmail())
                .telefone(usuario.getTelefone())
                .cpf(usuario.getCpf())
                .role(usuario.getRole())
                .dataCadastro(usuario.getDataCadastro())
                .build();
    }
}
