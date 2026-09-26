package com.saksham.splitr.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OpenRouterService {

    @Value("${openrouter.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

    public Map<String, Object> parseReceipt(String base64Image) {
        Map<String, Object> errorMap = new HashMap<>();
        
        if (apiKey == null || apiKey.isEmpty()) {
            errorMap.put("error", "OpenRouter API key not configured in Render environment variables.");
            return errorMap;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("HTTP-Referer", "http://localhost:5173"); 
        headers.set("X-Title", "FairShare"); 

        String prompt = "Parse the following receipt image and return ONLY a JSON array of items and their prices. Format: [{\"item\": \"name\", \"price\": 10.50}]. Do not include markdown or explanations.";

        Map<String, Object> textContent = new HashMap<>();
        textContent.put("type", "text");
        textContent.put("text", prompt);

        Map<String, Object> imageContent = new HashMap<>();
        imageContent.put("type", "image_url");
        Map<String, String> imageUrl = new HashMap<>();
        imageUrl.put("url", base64Image); 
        imageContent.put("image_url", imageUrl);

        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", List.of(textContent, imageContent));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "meta-llama/llama-3.2-11b-vision-instruct");
        requestBody.put("messages", List.of(message));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            Map<String, Object> response = restTemplate.postForObject(OPENROUTER_URL, request, Map.class);
            
            if (response != null && response.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> choice = choices.get(0);
                    Map<String, Object> messageResp = (Map<String, Object>) choice.get("message");
                    String content = (String) messageResp.get("content");
                    
                    if (content != null) {
                        content = content.trim();
                        if (content.startsWith("```json")) content = content.substring(7);
                        else if (content.startsWith("```")) content = content.substring(3);
                        if (content.endsWith("```")) content = content.substring(0, content.length() - 3);
                        
                        Map<String, Object> successMap = new HashMap<>();
                        successMap.put("result", content.trim());
                        return successMap;
                    }
                }
            }
            errorMap.put("error", "Failed to parse receipt from AI response.");
            return errorMap;
        } catch (Exception e) {
            e.printStackTrace();
            errorMap.put("error", "API error: " + e.getMessage());
            return errorMap;
        }
    }
}
