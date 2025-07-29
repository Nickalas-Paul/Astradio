import { useState, useCallback } from 'react';
import { astroTextGenerator, type ChartData, type GeneratedText } from './textGenerator';

export interface UseTextGeneratorOptions {
  onGenerated?: (text: GeneratedText) => void;
  onError?: (error: string) => void;
}

export function useTextGenerator(options: UseTextGeneratorOptions = {}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<GeneratedText | null>(null);

  const generateDailyExplainer = useCallback(async (
    transits: ChartData, 
    userChart: ChartData
  ): Promise<GeneratedText> => {
    setIsGenerating(true);
    try {
      const result = astroTextGenerator.generateDailyExplainer(transits, userChart);
      setLastGenerated(result);
      options.onGenerated?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate daily explainer';
      options.onError?.(errorMessage);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [options]);

  const generateDailyAlignment = useCallback(async (
    currentTransits: ChartData, 
    userChart: ChartData
  ): Promise<GeneratedText> => {
    setIsGenerating(true);
    try {
      const result = astroTextGenerator.generateDailyAlignment(currentTransits, userChart);
      setLastGenerated(result);
      options.onGenerated?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate daily alignment';
      options.onError?.(errorMessage);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [options]);

  const generateChartComparison = useCallback(async (
    chart1: ChartData, 
    chart2: ChartData
  ): Promise<GeneratedText> => {
    setIsGenerating(true);
    try {
      const result = astroTextGenerator.generateChartComparison(chart1, chart2);
      setLastGenerated(result);
      options.onGenerated?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate chart comparison';
      options.onError?.(errorMessage);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [options]);

  const generateSandboxInterpretation = useCallback(async (
    selectedPlanets: string[], 
    selectedHouses: number[], 
    chartData: ChartData
  ): Promise<GeneratedText> => {
    setIsGenerating(true);
    try {
      const result = astroTextGenerator.generateSandboxInterpretation(selectedPlanets, selectedHouses, chartData);
      setLastGenerated(result);
      options.onGenerated?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate sandbox interpretation';
      options.onError?.(errorMessage);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [options]);

  return {
    isGenerating,
    lastGenerated,
    generateDailyExplainer,
    generateDailyAlignment,
    generateChartComparison,
    generateSandboxInterpretation
  };
} 