package com.yasmin.oms.config;

import com.yasmin.oms.domain.model.Role;
import com.yasmin.oms.domain.model.Usuario;
import com.yasmin.oms.domain.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements ApplicationRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String SENHA_PADRAO = "senha123";

    @Override
    public void run(ApplicationArguments args) {
        String senhaEncoded = passwordEncoder.encode(SENHA_PADRAO);

        usuarioRepository.findByEmail("admin@oms.com").ifPresentOrElse(
                admin -> {
                    admin.setSenha(senhaEncoded);
                    usuarioRepository.save(admin);
                    log.info("Senha do usuário admin atualizada: admin@oms.com / {}", SENHA_PADRAO);
                },
                () -> {
                    Usuario admin = new Usuario("Administrador", "admin@oms.com", senhaEncoded, Role.ADMIN);
                    usuarioRepository.save(admin);
                    log.info("Usuário admin criado: admin@oms.com / {}", SENHA_PADRAO);
                }
        );

        usuarioRepository.findByEmail("funcionario@oms.com").ifPresentOrElse(
                funcionario -> {
                    funcionario.setSenha(senhaEncoded);
                    usuarioRepository.save(funcionario);
                    log.info("Senha do usuário funcionário atualizada: funcionario@oms.com / {}", SENHA_PADRAO);
                },
                () -> {
                    Usuario funcionario = new Usuario("Funcionário", "funcionario@oms.com", senhaEncoded, Role.FUNCIONARIO);
                    usuarioRepository.save(funcionario);
                    log.info("Usuário funcionário criado: funcionario@oms.com / {}", SENHA_PADRAO);
                }
        );

        usuarioRepository.findByEmail("cliente@oms.com").ifPresentOrElse(
                cliente -> {
                    cliente.setSenha(senhaEncoded);
                    usuarioRepository.save(cliente);
                    log.info("Senha do usuário cliente atualizada: cliente@oms.com / {}", SENHA_PADRAO);
                },
                () -> {
                    Usuario cliente = new Usuario("Cliente", "cliente@oms.com", senhaEncoded, Role.CLIENTE);
                    usuarioRepository.save(cliente);
                    log.info("Usuário cliente criado: cliente@oms.com / {}", SENHA_PADRAO);
                }
        );
    }
}
