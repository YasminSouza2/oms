package com.yasmin.oms.api.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProdutoUpdateRequest {

    @Size(max = 255)
    private String nome;

    private String descricao;

    @DecimalMin(value = "0.01", message = "Preço deve ser maior que zero")
    private BigDecimal preco;

    @DecimalMin(value = "0", message = "Estoque não pode ser negativo")
    private Integer estoque;

    @Size(max = 50)
    private String sku;
}
