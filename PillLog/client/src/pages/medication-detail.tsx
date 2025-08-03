import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Medication, SymptomRecord } from "@shared/schema";
import SymptomChart from "@/components/symptom-chart";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { ko } from "date-fns/locale";

export default function MedicationDetailPage() {
  const [, params] = useRoute("/medications/:id");
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"info" | "symptoms">("info");

  const medicationId = params?.id;

  const { data: medication, isLoading: medicationLoading } = useQuery<Medication>({
    queryKey: ['/api/medications', medicationId],
    enabled: !!medicationId,
  });

  const { data: symptomRecords = [] } = useQuery<SymptomRecord[]>({
    queryKey: ['/api/symptoms', medicationId],
    enabled: !!medicationId,
  });

  if (medicationLoading) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-500 mt-2">약물 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!medication) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <i className="fas fa-exclamation-triangle text-4xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">약물을 찾을 수 없습니다</h3>
          <Button onClick={() => setLocation('/medications')} variant="outline">
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const getProgress = () => {
    if (!medication.startDate || !medication.endDate) return 0;
    const totalDays = differenceInDays(new Date(medication.endDate), new Date(medication.startDate));
    const daysPassed = differenceInDays(new Date(), new Date(medication.startDate));
    return Math.min(Math.max((daysPassed / totalDays) * 100, 0), 100);
  };

  const progress = getProgress();

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3 mb-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation('/medications')}
          >
            <i className="fas fa-arrow-left text-lg"></i>
          </Button>
          <h2 className="text-lg font-bold text-gray-900">약 상세 정보</h2>
        </div>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-bold text-gray-900 text-lg">{medication.name}</h3>
            {medication.dosage && (
              <p className="text-gray-600 mt-1">{medication.dosage}</p>
            )}
            {medication.frequency && (
              <p className="text-gray-600">{medication.frequency}</p>
            )}
            <div className="flex items-center space-x-4 mt-3">
              {medication.hospitalName && (
                <Badge className="bg-white text-gray-800">
                  {medication.hospitalName}
                </Badge>
              )}
              {medication.doctorName && (
                <span className="text-sm text-gray-600">{medication.doctorName}</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          <button
            className={`flex-1 py-3 px-4 text-center border-b-2 font-medium ${
              activeTab === "info"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500"
            }`}
            onClick={() => setActiveTab("info")}
          >
            정보
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center border-b-2 font-medium ${
              activeTab === "symptoms"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500"
            }`}
            onClick={() => setActiveTab("symptoms")}
          >
            증상 기록
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 space-y-4">
        {activeTab === "info" && (
          <>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">복용 정보</h4>
                <div className="space-y-2 text-sm">
                  {medication.duration && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">복용 기간:</span>
                      <span className="font-medium">{medication.duration}</span>
                    </div>
                  )}
                  {medication.prescribedDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">처방일:</span>
                      <span className="font-medium">
                        {formatDistanceToNow(new Date(medication.prescribedDate), { 
                          addSuffix: true, 
                          locale: ko 
                        })}
                      </span>
                    </div>
                  )}
                  {medication.effect && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">효능:</span>
                      <span className="font-medium">{medication.effect}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">상태:</span>
                    <span className={`font-medium ${medication.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                      {medication.isActive ? '복용 중' : '복용 완료'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {medication.isActive && medication.startDate && medication.endDate && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">복용 현황</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">진행률</span>
                    <span className="text-sm font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>시작: {new Date(medication.startDate).toLocaleDateString('ko-KR')}</span>
                    <span>종료: {new Date(medication.endDate).toLocaleDateString('ko-KR')}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {activeTab === "symptoms" && (
          <div className="space-y-4">
            {symptomRecords.length > 0 ? (
              <>
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-4">증상 변화 추이</h4>
                    <SymptomChart data={symptomRecords} />
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">증상 기록 내역</h4>
                  {symptomRecords.map((record) => (
                    <Card key={record.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-primary">
                            통증 수준: {record.painLevel}/10
                          </span>
                          <span className="text-sm text-gray-500">
                            {record.recordedAt && formatDistanceToNow(new Date(record.recordedAt), { 
                              addSuffix: true, 
                              locale: ko 
                            })}
                          </span>
                        </div>
                        {record.symptoms && record.symptoms.length > 0 && (
                          <p className="text-sm text-gray-600 mb-2">
                            증상: {record.symptoms.join(', ')}
                          </p>
                        )}
                        {record.notes && (
                          <p className="text-sm text-gray-600">{record.notes}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-chart-line text-4xl text-gray-300 mb-4"></i>
                <h4 className="text-lg font-medium text-gray-900 mb-2">증상 기록이 없습니다</h4>
                <p className="text-gray-600 mb-4">증상을 기록하여 복용 효과를 추적해보세요</p>
                <Button 
                  onClick={() => setLocation('/symptoms')}
                  className="bg-primary hover:bg-blue-600"
                >
                  증상 기록하기
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
