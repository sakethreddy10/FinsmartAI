import os
from typing import List, Dict, Optional, Any
from langchain_core.documents import Document
from langchain_astradb import AstraDBVectorStore
from finrag.model_factory import get_huggingface_embeddings
from config import (
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    COLLECTION_NAME
)

class FinRAGVectorStore:
    def __init__(self):
        """
        Step 3: Embedding & Vector Storage interface.
        """
        self.embedding = get_huggingface_embeddings()
        
        # Initialize connection
        # autodetect behavior: Use content_field explicit for empty DB support
        self.vectorstore = AstraDBVectorStore(
            embedding=self.embedding,
            collection_name=COLLECTION_NAME,
            api_endpoint=ASTRA_DB_API_ENDPOINT,
            token=ASTRA_DB_APPLICATION_TOKEN,
            autodetect_collection=False,
            content_field="page_content"
        )

    def add_documents(self, documents: List[Document]):
        """
        Stores chunks in AstraDB.
        """
        self.vectorstore.add_documents(documents)
        print(f"Stored {len(documents)} chunks in AstraDB.")

    def delete_user_data(self, user_id: str):
        """
        Step 12: Cleanup logic.
        Deletes all documents for a specific user to prevent storage waste logic.
        """
        try:
            print(f"Cleaning up old data for User: {user_id}...")
            # Direct AstraPy fix to delete via metadata filter
            self.vectorstore.astra_env.collection.delete_many(
                filter={"user_id": user_id}
            )
            print(f"Cleanup complete for user: {user_id}")
            
        except Exception as e:
            print(f"Cleanup Warning: {e} (Continuing ingestion)")

    def similarity_search_with_score(
        self, query: str, k: int = 4, filter: Optional[Dict[str, Any]] = None
    ) -> List[tuple[Document, float]]:
        """
        Step 5 & 6: Retrieval & Context Validation support.
        """
        return self.vectorstore.similarity_search_with_score(query, k=k, filter=filter)
