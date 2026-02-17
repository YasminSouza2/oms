package com.yasmin.oms.api.controller;

import com.yasmin.oms.api.dto.request.EnderecoRequest;
import com.yasmin.oms.api.dto.response.EnderecoResponse;
import com.yasmin.oms.application.service.EnderecoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/usuarios/{usuarioId}/enderecos")
@RequiredArgsConstructor
public class EnderecoController {

    private final EnderecoService enderecoService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('FUNCIONARIO') or #usuarioId.equals(authentication.principal.id)")
    public ResponseEntity<List<EnderecoResponse>> listar(@PathVariable UUID usuarioId) {
        return ResponseEntity.ok(enderecoService.listarPorUsuario(usuarioId));
    }

    @GetMapping("/{enderecoId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FUNCIONARIO') or #usuarioId.equals(authentication.principal.id)")
    public ResponseEntity<EnderecoResponse> buscar(
            @PathVariable UUID usuarioId,
            @PathVariable UUID enderecoId) {
        return ResponseEntity.ok(enderecoService.buscarPorIdEUsuario(enderecoId, usuarioId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('FUNCIONARIO') or #usuarioId.equals(authentication.principal.id)")
    public ResponseEntity<EnderecoResponse> criar(
            @PathVariable UUID usuarioId,
            @Valid @RequestBody EnderecoRequest request) {
        EnderecoResponse response = enderecoService.criar(usuarioId, request);
        var uri = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.getId())
                .toUri();
        return ResponseEntity.created(uri).body(response);
    }

    @PutMapping("/{enderecoId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FUNCIONARIO') or #usuarioId.equals(authentication.principal.id)")
    public ResponseEntity<EnderecoResponse> atualizar(
            @PathVariable UUID usuarioId,
            @PathVariable UUID enderecoId,
            @Valid @RequestBody EnderecoRequest request) {
        return ResponseEntity.ok(enderecoService.atualizar(usuarioId, enderecoId, request));
    }

    @DeleteMapping("/{enderecoId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FUNCIONARIO') or #usuarioId.equals(authentication.principal.id)")
    public ResponseEntity<Void> excluir(
            @PathVariable UUID usuarioId,
            @PathVariable UUID enderecoId) {
        enderecoService.excluir(usuarioId, enderecoId);
        return ResponseEntity.noContent().build();
    }
}
