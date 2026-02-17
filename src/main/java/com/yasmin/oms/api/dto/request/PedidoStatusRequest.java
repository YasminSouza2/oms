package com.yasmin.oms.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PedidoStatusRequest {

    @NotBlank(message = "Status é obrigatório")
    @Pattern(regexp = "PENDENTE|CONFIRMADO|ENVIADO|ENTREGUE|CANCELADO",
            message = "Status deve ser: PENDENTE, CONFIRMADO, ENVIADO, ENTREGUE ou CANCELADO")
    private String status;
}
