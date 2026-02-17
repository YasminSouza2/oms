package com.yasmin.oms.api.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioUpdateRequest {

    @Size(max = 255)
    private String nome;

    @Email(message = "Email inválido")
    @Size(max = 255)
    private String email;

    @Size(min = 6, message = "Senha deve ter no mínimo 6 caracteres")
    private String senha;

    @Size(max = 20)
    private String telefone;

    @Size(max = 14)
    private String cpf;
}
