package com.saksham.splitr.controller;

import com.saksham.splitr.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiController {

    private final GeminiService geminiService;

    @Autowired
    public AiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/parse-receipt")
    public ResponseEntity<Map<String, Object>> parseReceipt(@RequestBody Map<String, String> payload) {
        String imageBase64 = payload.get("imageBase64");
        if (imageBase64 == null || imageBase64.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "imageBase64 is required"));
        }
        
        Map<String, Object> response = geminiService.parseReceipt(imageBase64);
        if (response.containsKey("error")) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }
}
