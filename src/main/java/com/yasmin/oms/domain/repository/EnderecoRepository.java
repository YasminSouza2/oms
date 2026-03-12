package com.yasmin.oms.domain.repository;

import com.yasmin.oms.domain.model.Endereco;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EnderecoRepository extends JpaRepository<Endereco, UUID> {

    List<Endereco> findByUsuarioId(UUID usuarioId);

    boolean existsByIdAndUsuarioId(UUID enderecoId, UUID usuarioId);
}
