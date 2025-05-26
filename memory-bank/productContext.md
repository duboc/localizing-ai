# Product Context

*This document outlines the "why" behind the project.*

## Problem Solved

-   Need a simple, standardized way to send diverse data (text, images) to Vertex AI (Gemini) for analysis from various clients (initially `curl`, later a React frontend).
-   Avoids direct Vertex AI SDK integration in every client application.

## How it Should Work

-   A backend API receives HTTP requests.
-   The API validates/processes the incoming payload.
-   The API uses `vertex_libs.py` to communicate with Vertex AI.
-   The API returns the analysis result from Vertex AI to the original caller.

## User Experience Goals

-   **API Users (Developers)**: Simple, well-documented endpoint(s), easy to integrate with. Clear error messages. Flexible payload acceptance.
-   **End Users (via Frontend - Future)**: Seamless interaction with AI capabilities without being directly exposed to Vertex AI complexities. Fast responses.
