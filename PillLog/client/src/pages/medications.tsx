import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Medication } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MedicationCard from "@/components/medication-card";
import MedicationSearch from "@/components/medication-search";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

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

export default function MedicationsPage() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [showMedicationSearch, setShowMedicationSearch] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: medications = [], isLoading } = useQuery<Medication[]>({
    queryKey: ['/api/medications'],
  });

  const markTakenMutation = useMutation({
    mutationFn: async (medicationId: string) => {
      const response = await apiRequest('PATCH', `/api/medications/${medicationId}`, {
        isActive: false
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "복용 완료",
        description: "복용이 완료되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
    },
    onError: (error: Error) => {
      toast({
        title: "오류",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addMedicationMutation = useMutation({
    mutationFn: async (medicationData: Partial<Medication>) => {
      const response = await apiRequest('POST', '/api/medications', medicationData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "약물 추가 완료",
        description: "새로운 약물이 추가되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
    },
    onError: (error: Error) => {
      toast({
        title: "추가 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredMedications = medications.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeMedications = filteredMedications.filter(med => med.isActive);
  const completedMedications = filteredMedications.filter(med => !med.isActive);

  const handleViewDetails = (medicationId: string) => {
    setLocation(`/medications/${medicationId}`);
  };

  const handleMarkTaken = (medicationId: string) => {
    markTakenMutation.mutate(medicationId);
  };

  const handleSelectMedication = (medicationInfo: MedicationInfo) => {
    const medicationData = {
      name: medicationInfo.name,
      dosage: medicationInfo.usage.replace(/<[^>]*>/g, '').substring(0, 200) || undefined,
      effect: medicationInfo.effect.replace(/<[^>]*>/g, '').substring(0, 200) || undefined,
      hospitalName: medicationInfo.company || undefined,
      isActive: true,
    };
    
    addMedicationMutation.mutate(medicationData);
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-500 mt-2">약물 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">나의 약</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowMedicationSearch(true)}
        >
          <i className="fas fa-plus mr-1"></i>직접 추가
        </Button>
      </div>

      <div className="relative">
        <Input
          type="text"
          placeholder="약 이름으로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
      </div>

      {activeMedications.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <span className="w-3 h-3 bg-success rounded-full mr-2"></span>
            복용 중인 약 ({activeMedications.length})
          </h3>
          {activeMedications.map((medication) => (
            <MedicationCard
              key={medication.id}
              medication={medication}
              onViewDetails={handleViewDetails}
              onMarkTaken={handleMarkTaken}
            />
          ))}
        </div>
      )}

      {completedMedications.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <span className="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
            복용 완료된 약 ({completedMedications.length})
          </h3>
          {completedMedications.map((medication) => (
            <div key={medication.id} className="opacity-75">
              <MedicationCard
                medication={medication}
                onViewDetails={handleViewDetails}
              />
            </div>
          ))}
        </div>
      )}

      {filteredMedications.length === 0 && (
        <div className="text-center py-12">
          <i className="fas fa-pills text-4xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">약물이 없습니다</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? '검색 결과가 없습니다' : '처방전을 업로드하거나 직접 추가해보세요'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setLocation('/')} className="bg-primary hover:bg-blue-600">
              처방전 업로드하기
            </Button>
          )}
        </div>
      )}

      <MedicationSearch
        isOpen={showMedicationSearch}
        onClose={() => setShowMedicationSearch(false)}
        onSelect={handleSelectMedication}
      />
    </div>
  );
}
