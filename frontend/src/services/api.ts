import { ScanResult, ScanStats, ModelPerformanceData } from '../types/index.js';

export async function analyzeUrl(url: string): Promise<ScanResult> {
  const response = await fetch('/api/analyze/url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `Error ${response.status}: Failed to analyze URL`);
  }

  return response.json();
}

export async function analyzeText(text: string, type: 'email' | 'sms' | 'text' = 'email'): Promise<ScanResult> {
  const response = await fetch('/api/analyze/text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, type }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `Error ${response.status}: Failed to analyze text`);
  }

  return response.json();
}

export async function getScans(limit: number = 50, filter: string = 'all', search: string = ''): Promise<ScanResult[]> {
  const params = new URLSearchParams();
  if (limit) params.set('limit', limit.toString());
  if (filter && filter !== 'all') params.set('filter', filter);
  if (search) params.set('search', search);

  const response = await fetch(`/api/scans?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to load scan records');
  }
  return response.json();
}

export async function getScanById(id: string): Promise<ScanResult> {
  const response = await fetch(`/api/scans/${id}`);
  if (!response.ok) {
    throw new Error('Failed to load scan details');
  }
  return response.json();
}

export async function deleteScan(id: string): Promise<{ success: boolean; id: string }> {
  const response = await fetch(`/api/scans/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error('Failed to delete scan record');
  }
  return response.json();
}

export async function clearAllScans(): Promise<{ success: boolean }> {
  const response = await fetch('/api/scans', { method: 'DELETE' });
  if (!response.ok) {
    throw new Error('Failed to clear scan history');
  }
  return response.json();
}

export async function getStatistics(): Promise<ScanStats> {
  const response = await fetch('/api/statistics');
  if (!response.ok) {
    throw new Error('Failed to load statistics');
  }
  return response.json();
}

export async function getModelPerformance(): Promise<ModelPerformanceData> {
  const response = await fetch('/api/model-performance');
  if (!response.ok) {
    throw new Error('Failed to load model performance');
  }
  return response.json();
}

export async function retrainModels(): Promise<{ status: string; message: string; bestModel: string }> {
  const response = await fetch('/api/retrain', { method: 'POST' });
  if (!response.ok) {
    throw new Error('Failed to execute model retraining');
  }
  return response.json();
}

export async function checkHealth(): Promise<{ status: string; version: string; database: string }> {
  const response = await fetch('/api/health');
  if (!response.ok) {
    throw new Error('Backend health check failed');
  }
  return response.json();
}
