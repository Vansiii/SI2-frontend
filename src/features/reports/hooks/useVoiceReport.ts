/**
 * Hook para gestionar reportes por voz
 */
import { useState } from 'react';
import { voiceReportService } from '../services';
import type { VoiceInterpretResponse, ReportScope } from '../types';

export const useVoiceReport = () => {
  const [interpreting, setInterpreting] = useState(false);
  const [interpretation, setInterpretation] = useState<VoiceInterpretResponse | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const interpretAudio = async (audioFile: File, scope: ReportScope) => {
    try {
      setInterpreting(true);
      setError(null);
      const data = await voiceReportService.interpretAudio(audioFile, scope);
      setInterpretation(data);
      return data;
    } catch (err: any) {
      const errorMsg = err.message || 'Error al interpretar audio';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setInterpreting(false);
    }
  };

  const clearInterpretation = () => {
    setInterpretation(null);
    setError(null);
  };

  return {
    interpreting,
    interpretation,
    error,
    interpretAudio,
    clearInterpretation,
  };
};
