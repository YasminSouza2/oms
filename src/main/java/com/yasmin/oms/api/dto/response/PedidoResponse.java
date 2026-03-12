package com.yasmin.oms.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PedidoResponse {

    private UUID id;
    private UUID usuarioId;
    private String usuarioNome;
    private EnderecoResponse enderecoCobranca;
    private EnderecoResponse enderecoEntrega;
    private String status;
    private BigDecimal total;
    private LocalDateTime dataPedido;
    private List<ItemPedidoResponse> itens;
}
