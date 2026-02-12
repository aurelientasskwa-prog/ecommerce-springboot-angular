package com.example.demo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.core.env.Environment;

@SpringBootApplication
@ComponentScan(basePackages = {"com.example.demo"})
public class DemoApplication {
    private static final Logger log = LoggerFactory.getLogger(DemoApplication.class);
    
    public static void main(String[] args) {
        try {
            log.info("Démarrage de l'application...");
            SpringApplication app = new SpringApplication(DemoApplication.class);
            Environment env = app.run(args).getEnvironment();
            log.info("\n----------------------------------------------------------\n\t" +
                    "Application '{}' est en cours d'exécution!\n\t" +
                    "URL d'accès: http://localhost:{}{}\n" +
                    "----------------------------------------------------------",
                    env.getProperty("spring.application.name"),
                    env.getProperty("server.port"),
                    env.getProperty("server.servlet.context-path", ""));
        } catch (Exception e) {
            log.error("Erreur lors du démarrage de l'application", e);
        }
    }
}
