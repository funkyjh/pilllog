import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

interface MedicationInfo {
  name: string;
  company: string;
  effect: string;
  usage: string;
  precautions: string;
  sideEffects: string;
  ingredients: string;
  approvalNumber: string;
}

interface SearchResult {
  medications: MedicationInfo[];
  totalCount: number;
}

interface MedicationSearchProps {
  onSelect: (medication: MedicationInfo) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function MedicationSearch({ onSelect, isOpen, onClose }: MedicationSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"name" | "ingredient" | "company">("name");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: searchResult, isLoading, error } = useQuery<SearchResult>({
    queryKey: ['/api/medications/search', searchQuery, searchType, currentPage],
    enabled: isOpen && searchQuery.trim().length > 0,
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentPage(1); // Reset to first page on new search
    }
  };

  const handleSelectMedication = (medication: MedicationInfo) => {
    onSelect(medication);
    onClose();
    setSearchQuery("");
  };

  const getSearchTypeLabel = (type: string) => {
    switch (type) {
      case 'ingredient': return '성분명';
      case 'company': return '제조사';
      default: return '약품명';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">약품 정보 검색</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <i className="fas fa-times"></i>
            </Button>
          </div>

          <form onSubmit={handleSearch} className="space-y-3">
            <div className="flex space-x-2">
              <Select value={searchType} onValueChange={(value: "name" | "ingredient" | "company") => setSearchType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">약품명</SelectItem>
                  <SelectItem value="ingredient">성분명</SelectItem>
                  <SelectItem value="company">제조사</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="text"
                placeholder={`${getSearchTypeLabel(searchType)}으로 검색...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !searchQuery.trim()}>
                {isLoading ? "검색 중..." : "검색"}
              </Button>
            </div>
          </form>
        </div>

        <div className="p-4">
          {error && (
            <div className="text-center py-8">
              <i className="fas fa-exclamation-triangle text-4xl text-red-400 mb-2"></i>
              <p className="text-red-600 mb-2">검색 중 오류가 발생했습니다</p>
              <p className="text-sm text-gray-600">
                API 키가 설정되지 않았거나 네트워크 오류일 수 있습니다
              </p>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-500 mt-2">약품 정보를 검색하는 중...</p>
            </div>
          )}

          {searchResult && !isLoading && (
            <>
              {searchResult.medications.length > 0 ? (
                <>
                  <div className="mb-4 text-sm text-gray-600">
                    총 {searchResult.totalCount}개의 결과 중 {searchResult.medications.length}개 표시
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {searchResult.medications.map((medication, index) => (
                      <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4" onClick={() => handleSelectMedication(medication)}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{medication.name}</h4>
                              {medication.company && (
                                <Badge variant="secondary" className="mt-1 text-xs">
                                  {medication.company}
                                </Badge>
                              )}
                              {medication.ingredients && (
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                  성분: {medication.ingredients}
                                </p>
                              )}
                              {medication.effect && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  효능: {medication.effect.replace(/<[^>]*>/g, '').substring(0, 100)}...
                                </p>
                              )}
                            </div>
                            <i className="fas fa-chevron-right text-gray-400 ml-2"></i>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {searchResult.totalCount > searchResult.medications.length && (
                    <div className="mt-4 text-center">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={isLoading}
                      >
                        더 보기
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-search text-4xl text-gray-300 mb-2"></i>
                  <p className="text-gray-500">검색 결과가 없습니다</p>
                  <p className="text-sm text-gray-400 mt-1">다른 검색어를 시도해보세요</p>
                </div>
              )}
            </>
          )}

          {!searchQuery.trim() && !isLoading && (
            <div className="text-center py-12">
              <i className="fas fa-pills text-4xl text-gray-300 mb-4"></i>
              <h4 className="text-lg font-medium text-gray-900 mb-2">약품 정보 검색</h4>
              <p className="text-gray-600 mb-2">식품의약품안전처 공식 데이터베이스에서</p>
              <p className="text-gray-600">정확한 약품 정보를 검색할 수 있습니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}