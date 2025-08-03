// 식품의약품안전처 의약품 정보 검색 서비스
export interface MedicationInfo {
  name: string;
  company: string;
  effect: string;
  usage: string;
  precautions: string;
  sideEffects: string;
  ingredients: string;
  approvalNumber: string;
}

export interface SearchResult {
  medications: MedicationInfo[];
  totalCount: number;
}

class MedicationSearchService {
  private readonly baseUrl = 'http://apis.data.go.kr/1471000/DrugPrdtPrmsnInfoService05';
  private readonly serviceKey: string;

  constructor() {
    this.serviceKey = process.env.KFDA_API_KEY || '';
    if (!this.serviceKey) {
      console.warn('KFDA_API_KEY not found. Medication search will not work.');
    }
  }

  async searchByName(medicationName: string, pageNo: number = 1, numOfRows: number = 10): Promise<SearchResult> {
    if (!this.serviceKey) {
      throw new Error('API 키가 설정되지 않았습니다. KFDA_API_KEY 환경변수를 설정해주세요.');
    }

    try {
      const params = new URLSearchParams({
        serviceKey: this.serviceKey,
        pageNo: pageNo.toString(),
        numOfRows: numOfRows.toString(),
        type: 'json',
        item_name: medicationName, // 품목명으로 검색
      });

      const response = await fetch(`${this.baseUrl}/getDrugPrdtPrmsnInqSrvc05?${params}`);
      
      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.header?.resultCode !== '00') {
        throw new Error(`API 오류: ${data.header?.resultMsg || '알 수 없는 오류'}`);
      }

      const items = data.body?.items || [];
      const totalCount = data.body?.totalCount || 0;

      const medications: MedicationInfo[] = items.map((item: any) => ({
        name: item.ITEM_NAME || '',
        company: item.ENTP_NAME || '',
        effect: item.EE_DOC_DATA || item.MAIN_ITEM_INGR || '',
        usage: item.UD_DOC_DATA || '',
        precautions: item.NB_DOC_DATA || '',
        sideEffects: item.SE_DOC_DATA || '',
        ingredients: item.MAIN_ITEM_INGR || '',
        approvalNumber: item.ITEM_PERMIT_DATE || '',
      }));

      return {
        medications,
        totalCount,
      };
    } catch (error) {
      console.error('약품 검색 오류:', error);
      throw new Error('약품 정보를 검색하는 중 오류가 발생했습니다.');
    }
  }

  // 성분명으로 검색
  async searchByIngredient(ingredient: string, pageNo: number = 1, numOfRows: number = 10): Promise<SearchResult> {
    if (!this.serviceKey) {
      throw new Error('API 키가 설정되지 않았습니다.');
    }

    try {
      const params = new URLSearchParams({
        serviceKey: this.serviceKey,
        pageNo: pageNo.toString(),
        numOfRows: numOfRows.toString(),
        type: 'json',
        main_item_ingr: ingredient,
      });

      const response = await fetch(`${this.baseUrl}/getDrugPrdtPrmsnInqSrvc05?${params}`);
      const data = await response.json();

      if (data.header?.resultCode !== '00') {
        throw new Error(`API 오류: ${data.header?.resultMsg || '알 수 없는 오류'}`);
      }

      const items = data.body?.items || [];
      const totalCount = data.body?.totalCount || 0;

      const medications: MedicationInfo[] = items.map((item: any) => ({
        name: item.ITEM_NAME || '',
        company: item.ENTP_NAME || '',
        effect: item.EE_DOC_DATA || item.MAIN_ITEM_INGR || '',
        usage: item.UD_DOC_DATA || '',
        precautions: item.NB_DOC_DATA || '',
        sideEffects: item.SE_DOC_DATA || '',
        ingredients: item.MAIN_ITEM_INGR || '',
        approvalNumber: item.ITEM_PERMIT_DATE || '',
      }));

      return {
        medications,
        totalCount,
      };
    } catch (error) {
      console.error('성분 검색 오류:', error);
      throw new Error('성분 정보를 검색하는 중 오류가 발생했습니다.');
    }
  }

  // 제조사로 검색
  async searchByCompany(companyName: string, pageNo: number = 1, numOfRows: number = 10): Promise<SearchResult> {
    if (!this.serviceKey) {
      throw new Error('API 키가 설정되지 않았습니다.');
    }

    try {
      const params = new URLSearchParams({
        serviceKey: this.serviceKey,
        pageNo: pageNo.toString(),
        numOfRows: numOfRows.toString(),
        type: 'json',
        entp_name: companyName,
      });

      const response = await fetch(`${this.baseUrl}/getDrugPrdtPrmsnInqSrvc05?${params}`);
      const data = await response.json();

      if (data.header?.resultCode !== '00') {
        throw new Error(`API 오류: ${data.header?.resultMsg || '알 수 없는 오류'}`);
      }

      const items = data.body?.items || [];
      const totalCount = data.body?.totalCount || 0;

      const medications: MedicationInfo[] = items.map((item: any) => ({
        name: item.ITEM_NAME || '',
        company: item.ENTP_NAME || '',
        effect: item.EE_DOC_DATA || item.MAIN_ITEM_INGR || '',
        usage: item.UD_DOC_DATA || '',
        precautions: item.NB_DOC_DATA || '',
        sideEffects: item.SE_DOC_DATA || '',
        ingredients: item.MAIN_ITEM_INGR || '',
        approvalNumber: item.ITEM_PERMIT_DATE || '',
      }));

      return {
        medications,
        totalCount,
      };
    } catch (error) {
      console.error('제조사 검색 오류:', error);
      throw new Error('제조사 정보를 검색하는 중 오류가 발생했습니다.');
    }
  }
}

export const medicationSearchService = new MedicationSearchService();