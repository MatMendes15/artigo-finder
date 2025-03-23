package com.artigofinder.controllers;

import com.artigofinder.models.Artigos;
import com.artigofinder.models.FiltrosPesquisa;
import com.artigofinder.services.ArtigoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "Artigos", description = "Endpoints para busca de artigos acadêmicos")
public class ArtigoController {

    private final ArtigoService artigoServico;

    @Autowired
    public ArtigoController(ArtigoService artigoService) {
        this.artigoServico = artigoService;
    }

    @Operation(
            summary = "Pesquisar artigos acadêmicos",
            description = "Busca artigos acadêmicos com base em diversos critérios",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Busca realizada com sucesso"),
                    @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
            }
    )
    @GetMapping("/search/{query}")
    public ResponseEntity<Map<String, Object>> pesquisarArtigos(
            @Parameter(description = "Termo de busca") @PathVariable String query,
            @Parameter(description = "Limite de resultados (1-50)") @RequestParam(defaultValue = "10") int limit,
            @Parameter(description = "Ano inicial para filtro") @RequestParam(required = false) Integer from_year,
            @Parameter(description = "Ano final para filtro") @RequestParam(required = false) Integer to_year,
            @Parameter(description = "Mínimo de citações") @RequestParam(required = false) Integer min_citations,
            @Parameter(description = "Ordenação (year, citations)") @RequestParam(required = false) String sort_by) {

        try {
            FiltrosPesquisa filtros = null;
            if (from_year != null || to_year != null || min_citations != null || sort_by != null) {
                filtros = new FiltrosPesquisa(from_year, to_year, min_citations, sort_by);
            }

            List<Artigos> artigos = artigoServico.pesquisarArtigos(query, filtros, limit);

            Map<String, Object> response = new HashMap<>();
            response.put("artigos", artigos);
            response.put("total", artigos.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }
}