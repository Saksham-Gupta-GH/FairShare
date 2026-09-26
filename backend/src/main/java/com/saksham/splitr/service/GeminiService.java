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
public class GeminiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=";

    public Map<String, Object> parseReceipt(String base64Image) {
        Map<String, Object> errorMap = new HashMap<>();
        
        if (apiKey == null || apiKey.isEmpty()) {
            errorMap.put("error", "Google Gemini API key not configured in Render environment variables (GEMINI_API_KEY).");
            return errorMap;
        }

        // Clean the base64 string if it contains the data URI prefix
        String mimeType = "image/jpeg";
        String cleanBase64 = base64Image;
        if (base64Image.contains(",")) {
            String[] parts = base64Image.split(",");
            String header = parts[0];
            if (header.contains("png")) mimeType = "image/png";
            cleanBase64 = parts[1];
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String prompt = "Parse the following receipt image and return ONLY a JSON array of items and their prices. Format: [{\"item\": \"name\", \"price\": 10.50}]. Do not include markdown or explanations. Only output raw JSON.";

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

        Map<String, Object> inlineData = new HashMap<>();
        inlineData.put("mime_type", mimeType);
        inlineData.put("data", cleanBase64);
        
        Map<String, Object> imagePart = new HashMap<>();
        imagePart.put("inline_data", inlineData);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(textPart, imagePart));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(content));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            Map<String, Object> response = restTemplate.postForObject(GEMINI_URL + apiKey, request, Map.class);
            
            if (response != null && response.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> contentResp = (Map<String, Object>) candidate.get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) contentResp.get("parts");
                    
                    if (!parts.isEmpty()) {
                        String resultText = (String) parts.get(0).get("text");
                        if (resultText != null) {
                            resultText = resultText.trim();
                            if (resultText.startsWith("```json")) resultText = resultText.substring(7);
                            else if (resultText.startsWith("```")) resultText = resultText.substring(3);
                            if (resultText.endsWith("```")) resultText = resultText.substring(0, resultText.length() - 3);
                            
                            Map<String, Object> successMap = new HashMap<>();
                            successMap.put("result", resultText.trim());
                            return successMap;
                        }
                    }
                }
            }
            errorMap.put("error", "Failed to parse receipt from Gemini AI response.");
            return errorMap;
        } catch (Exception e) {
            e.printStackTrace();
            errorMap.put("error", "Google Gemini API error: " + e.getMessage());
            return errorMap;
        }
    }
}
