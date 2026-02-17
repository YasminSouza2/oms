package com.yasmin.oms.api.exception;

import java.util.UUID;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String recurso, UUID id) {
        super(String.format("%s não encontrado(a) com id: %s", recurso, id));
    }

    public ResourceNotFoundException(String mensagem) {
        super(mensagem);
    }
}
