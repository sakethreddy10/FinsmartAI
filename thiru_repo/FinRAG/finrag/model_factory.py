import torch
import streamlit as st
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from config import MODEL_NAME, EMBEDDING_MODEL, NVIDIA_API_KEY

@st.cache_resource
def get_huggingface_embeddings():
    """
    Loads the embedding model (Cached).
    User for Step 3 (Embedding).
    """
    print(f"Loading embedding model {EMBEDDING_MODEL}...")
    return HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)

@st.cache_resource
def get_llm():
    """
    Loads the Nvidia NIM Model.
    Step 8 (Answer Generation).
    """
    if not NVIDIA_API_KEY:
        st.error("NVIDIA_API_KEY not found in environment variables. Please check your .env file.")
        st.stop()
        
    print(f"Loading Nvidia NIM LLM {MODEL_NAME}...")
    
    llm = ChatNVIDIA(
        model=MODEL_NAME,
        api_key=NVIDIA_API_KEY, 
        temperature=0.1,
        max_tokens=1024,
        top_p=0.95
    )
    
    return llm
