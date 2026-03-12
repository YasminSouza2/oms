package com.yasmin.oms.domain.repository;

import com.yasmin.oms.domain.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, UUID> {

    @Query("SELECT DISTINCT p FROM Pedido p " +
           "LEFT JOIN FETCH p.usuario " +
           "LEFT JOIN FETCH p.enderecoCobranca " +
           "LEFT JOIN FETCH p.enderecoEntrega " +
           "LEFT JOIN FETCH p.itens i " +
           "LEFT JOIN FETCH i.produto " +
           "WHERE p.usuario.id = :usuarioId " +
           "ORDER BY p.dataPedido DESC")
    List<Pedido> findByUsuarioIdOrderByDataPedidoDesc(@Param("usuarioId") UUID usuarioId);

    @Query("SELECT DISTINCT p FROM Pedido p " +
           "LEFT JOIN FETCH p.usuario " +
           "LEFT JOIN FETCH p.enderecoCobranca " +
           "LEFT JOIN FETCH p.enderecoEntrega " +
           "LEFT JOIN FETCH p.itens i " +
           "LEFT JOIN FETCH i.produto " +
           "ORDER BY p.dataPedido DESC")
    List<Pedido> findAllWithDetails();

    @Query("SELECT p FROM Pedido p " +
           "LEFT JOIN FETCH p.usuario " +
           "LEFT JOIN FETCH p.enderecoCobranca " +
           "LEFT JOIN FETCH p.enderecoEntrega " +
           "LEFT JOIN FETCH p.itens i " +
           "LEFT JOIN FETCH i.produto " +
           "WHERE p.id = :id")
    Optional<Pedido> findByIdWithDetails(@Param("id") UUID id);
}
