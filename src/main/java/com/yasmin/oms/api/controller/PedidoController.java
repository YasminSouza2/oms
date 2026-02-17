package com.yasmin.oms.api.controller;

import com.yasmin.oms.api.dto.request.PedidoRequest;
import com.yasmin.oms.api.dto.request.PedidoStatusRequest;
import com.yasmin.oms.api.dto.response.PedidoResponse;
import com.yasmin.oms.application.service.PedidoService;
import com.yasmin.oms.config.security.UsuarioPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','FUNCIONARIO')")
    public ResponseEntity<List<PedidoResponse>> listarTodos() {
        return ResponseEntity.ok(pedidoService.listarTodos());
    }

    @GetMapping("/usuario/{usuarioId}")
    @PreAuthorize("hasAnyRole('ADMIN','FUNCIONARIO') or #usuarioId.equals(authentication.principal.id)")
    public ResponseEntity<List<PedidoResponse>> listarPorUsuario(@PathVariable UUID usuarioId) {
        return ResponseEntity.ok(pedidoService.listarPorUsuario(usuarioId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponse> buscar(@PathVariable UUID id) {
        return ResponseEntity.ok(pedidoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<PedidoResponse> criar(
            @Valid @RequestBody PedidoRequest request,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        if (principal != null && principal.getRole() == com.yasmin.oms.domain.model.Role.CLIENTE) {
            request.setUsuarioId(principal.getId());
        }
        PedidoResponse response = pedidoService.criar(request);
        var uri = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.getId())
                .toUri();
        return ResponseEntity.created(uri).body(response);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','FUNCIONARIO')")
    public ResponseEntity<PedidoResponse> atualizarStatus(
            @PathVariable UUID id,
            @Valid @RequestBody PedidoStatusRequest request) {
        return ResponseEntity.ok(pedidoService.atualizarStatus(id, request));
    }
}
