import { InsertMedication } from '@shared/schema';

interface ParsedMedicationData {
  name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  hospitalName?: string;
  doctorName?: string;
  effect?: string;
}

export function parsePrescriptionText(text: string): ParsedMedicationData {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const result: ParsedMedicationData = {};

  // Common Korean prescription patterns
  const patterns = {
    // 약물명 패턴 (약품명, 성분명 등)
    medication: /(?:약품명|성분명|제품명)[:\s]*([^\n]+)/i,
    
    // 용법용량 패턴
    dosage: /(?:용법용량|복용법|용량)[:\s]*([^\n]+)/i,
    
    // 투여일수/기간 패턴
    duration: /(?:투여일수|복용기간|일수)[:\s]*(\d+)일?/i,
    
    // 병원명 패턴
    hospital: /(?:의료기관|병원명|요양기관)[:\s]*([^\n]+)/i,
    
    // 의사명 패턴
    doctor: /(?:의사명|처방의|담당의)[:\s]*([^\n]+)/i,
    
    // 효능 패턴
    effect: /(?:효능|주치|적응증)[:\s]*([^\n]+)/i,
  };

  // Extract medication name (often appears early in prescription)
  for (const line of lines.slice(0, 10)) {
    if (line.includes('mg') || line.includes('정') || line.includes('캡슐')) {
      const medicationMatch = line.match(/([가-힣\w\s]+(?:\d+mg)?)/);
      if (medicationMatch && !result.name) {
        result.name = medicationMatch[1].trim();
        break;
      }
    }
  }

  // Extract frequency pattern (1일 3회, 식후 등)
  for (const line of lines) {
    const frequencyMatch = line.match(/(\d+일\s*\d+회|\d+회\/일|식[전후]|아침|점심|저녁)/);
    if (frequencyMatch && !result.frequency) {
      result.frequency = line.trim();
      break;
    }
  }

  // Apply regex patterns to full text
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match && match[1]) {
      (result as any)[key === 'medication' ? 'name' : key] = match[1].trim();
    }
  }

  // Extract hospital name if it contains common hospital keywords
  for (const line of lines) {
    if ((line.includes('병원') || line.includes('의원') || line.includes('클리닉')) && !result.hospitalName) {
      result.hospitalName = line.trim();
      break;
    }
  }

  // Extract doctor name if it contains common patterns
  for (const line of lines) {
    if ((line.includes('의사') || line.includes('선생님')) && line.length < 20 && !result.doctorName) {
      result.doctorName = line.replace(/의사|선생님/g, '').trim();
      break;
    }
  }

  return result;
}

export function createMedicationFromParsedData(
  parsedData: ParsedMedicationData,
  userId: string
): InsertMedication {
  return {
    userId,
    name: parsedData.name || '알 수 없는 약물',
    dosage: parsedData.dosage,
    frequency: parsedData.frequency,
    duration: parsedData.duration,
    hospitalName: parsedData.hospitalName,
    doctorName: parsedData.doctorName,
    effect: parsedData.effect,
    prescribedDate: new Date(),
    startDate: new Date(),
    endDate: parsedData.duration ? new Date(Date.now() + (parseInt(parsedData.duration) * 24 * 60 * 60 * 1000)) : undefined,
    isActive: true,
  };
}
