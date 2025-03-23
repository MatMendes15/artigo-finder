package com.artigofinder.services;

import com.artigofinder.models.Artigos;
import com.artigofinder.models.Autor;
import com.artigofinder.models.FiltrosPesquisa;
import com.artigofinder.utils.Cache;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ArtigoService {

    private final WebClient webClient;
    private final Cache<String, List<Artigos>> cacheConsulta;

    public ArtigoService() {
        this.webClient = WebClient.builder()
                .baseUrl("https://api.semanticscholar.org/graph/v1")
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
        this.cacheConsulta = new Cache<>(100);
    }

    public List<Artigos> pesquisarArtigos(String query, FiltrosPesquisa filtros, int limit) {
        // Construir chave de cache
        String chaveCache = "search:" + query + ":" + limit + ":" + filtros;
        if (cacheConsulta.contem(chaveCache)) {
            return cacheConsulta.obter(chaveCache);
        }

        // Construir parâmetros de consulta
        Map<String, String> params = new HashMap<>();
        params.put("query", query);
        params.put("limit", String.valueOf(limit));
        params.put("fields", "title,abstract,authors,year,venue,url,citationCount,references");

        // Adicionar filtros, se especificados
        if (filtros != null) {
            if (filtros.getAnoInicial() != null) {
                params.put("year", ">=" + filtros.getAnoInicial());
            }
            if (filtros.getAnoFinal() != null) {
                String yearParam = params.getOrDefault("year", "");
                params.put("year", yearParam.isEmpty()
                        ? "<=" + filtros.getAnoFinal()
                        : yearParam + ",<=" + filtros.getAnoFinal());
            }
        }

        // Fazer requisição à API
        Map<String, Object> response = webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path("/paper/search");
                    params.forEach(uriBuilder::queryParam);
                    return uriBuilder.build();
                })
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response == null) {
            throw new RuntimeException("Falha na requisição à API: Sem resposta");
        }

        List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
        List<Artigos> artigos = new ArrayList<>();

        for (Map<String, Object> paper : data) {
            // Extrair contagem de citações
            int citationCount = 0;
            if (paper.containsKey("citationCount")) {
                citationCount = (Integer) paper.get("citationCount");
            }

            // Processar autores
            List<Autor> autores = new ArrayList<>();
            List<Map<String, Object>> authorsList = (List<Map<String, Object>>) paper.getOrDefault("authors", Collections.emptyList());
            for (Map<String, Object> author : authorsList) {
                autores.add(new Autor(
                        (String) author.getOrDefault("name", ""),
                        (String) author.get("authorId")
                ));
            }

            // Processar referências
            List<String> referencias = new ArrayList<>();
            List<Map<String, Object>> refsList = (List<Map<String, Object>>) paper.getOrDefault("references", Collections.emptyList());
            for (Map<String, Object> ref : refsList) {
                if (ref.containsKey("paperId")) {
                    referencias.add((String) ref.get("paperId"));
                }
            }

            // Criar objeto Artigos
            Artigos artigo = new Artigos(
                    (String) paper.getOrDefault("paperId", ""),
                    (String) paper.getOrDefault("title", "Título Desconhecido"),
                    (String) paper.get("abstract"),
                    autores,
                    (Integer) paper.get("year"),
                    (String) paper.get("url"),
                    citationCount,
                    referencias,
                    (String) paper.get("venue"),
                    (String) paper.get("doi")
            );

            artigos.add(artigo);
        }

        // Aplicar ordenação, se especificada
        if (filtros != null && filtros.getOrdenarPor() != null) {
            if (filtros.getOrdenarPor().equals("year")) {
                artigos.sort((a1, a2) -> {
                    Integer year1 = a1.getAno() != null ? a1.getAno() : 0;
                    Integer year2 = a2.getAno() != null ? a2.getAno() : 0;
                    return year2.compareTo(year1); // ordem decrescente
                });
            } else if (filtros.getOrdenarPor().equals("citations")) {
                artigos.sort((a1, a2) -> Integer.compare(a2.getCitacoes(), a1.getCitacoes())); // ordem decrescente
            }
        }

        // Aplicar filtro de citações mínimas
        if (filtros != null && filtros.getCitacoesMinimas() != null) {
            artigos = artigos.stream()
                    .filter(a -> a.getCitacoes() >= filtros.getCitacoesMinimas())
                    .collect(Collectors.toList());
        }

        // Armazenar em cache e retornar
        cacheConsulta.adicionar(chaveCache, artigos);
        return artigos;
    }
}