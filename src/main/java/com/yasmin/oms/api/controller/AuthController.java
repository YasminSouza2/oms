package com.yasmin.oms.api.controller;

import com.yasmin.oms.api.dto.request.LoginRequest;
import com.yasmin.oms.api.dto.request.RegistroRequest;
import com.yasmin.oms.api.dto.request.UsuarioRequest;
import com.yasmin.oms.api.dto.response.LoginResponse;
import com.yasmin.oms.application.service.UsuarioService;
import com.yasmin.oms.config.security.JwtService;
import com.yasmin.oms.config.security.UsuarioPrincipal;
import com.yasmin.oms.domain.model.Role;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getSenha()));
        return ResponseEntity.ok(buildLoginResponse(authentication));
    }

    /**
     * Cadastro público para clientes. Qualquer pessoa pode se registrar para comprar no ecommerce.
     * O usuário é criado com role CLIENTE e já recebe o token de acesso na resposta.
     */
    @PostMapping("/registro")
    public ResponseEntity<LoginResponse> registro(@Valid @RequestBody RegistroRequest request) {
        UsuarioRequest usuarioRequest = UsuarioRequest.builder()
                .nome(request.getNome())
                .email(request.getEmail())
                .senha(request.getSenha())
                .telefone(request.getTelefone())
                .cpf(request.getCpf())
                .role(Role.CLIENTE)
                .build();
        usuarioService.criar(usuarioRequest);
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getSenha()));
        LoginResponse response = buildLoginResponse(authentication);
        var uri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/usuarios/{id}")
                .buildAndExpand(response.getId())
                .toUri();
        return ResponseEntity.created(uri).body(response);
    }

    private LoginResponse buildLoginResponse(Authentication authentication) {
        String token = jwtService.gerarToken(authentication);
        UsuarioPrincipal principal = (UsuarioPrincipal) authentication.getPrincipal();
        return LoginResponse.builder()
                .token(token)
                .tipo(LoginResponse.TIPO_BEARER)
                .id(principal.getId())
                .nome(principal.getNome())
                .email(principal.getEmail())
                .role(principal.getRole())
                .build();
    }
}
