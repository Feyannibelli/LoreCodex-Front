// src/pages/CreateGuidePage.tsx
import React from "react";
import CreateGuideForm from "../components/CreateGuideForm";

const CreateGuidePage: React.FC = () => {
    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">Crear Nueva Guía</h1>
            <CreateGuideForm />
        </div>
    );
};

export default CreateGuidePage;
