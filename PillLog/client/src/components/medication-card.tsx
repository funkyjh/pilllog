import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Medication } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface MedicationCardProps {
  medication: Medication;
  onViewDetails: (id: string) => void;
  onMarkTaken?: (id: string) => void;
}

export default function MedicationCard({ 
  medication, 
  onViewDetails, 
  onMarkTaken 
}: MedicationCardProps) {
  const getDaysLeft = () => {
    if (!medication.endDate) return null;
    const now = new Date();
    const endDate = new Date(medication.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysLeft = getDaysLeft();

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{medication.name}</h4>
            {medication.dosage && (
              <p className="text-sm text-gray-600 mt-1">{medication.dosage}</p>
            )}
            {medication.frequency && (
              <p className="text-sm text-gray-600">{medication.frequency}</p>
            )}
            <div className="flex items-center space-x-4 mt-2">
              {medication.hospitalName && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                  {medication.hospitalName}
                </Badge>
              )}
              {medication.doctorName && (
                <span className="text-xs text-gray-500">{medication.doctorName}</span>
              )}
            </div>
          </div>
          <div className="text-right">
            {medication.isActive && daysLeft !== null && (
              <>
                <p className="text-sm font-medium text-success">
                  {daysLeft}일 남음
                </p>
                <p className="text-xs text-gray-500">
                  처방일: {medication.prescribedDate ? 
                    formatDistanceToNow(new Date(medication.prescribedDate), { 
                      addSuffix: true, 
                      locale: ko 
                    }) : '알 수 없음'}
                </p>
              </>
            )}
            {!medication.isActive && (
              <p className="text-sm text-gray-500">복용 완료</p>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex space-x-2">
          {medication.isActive && onMarkTaken && (
            <Button 
              onClick={() => onMarkTaken(medication.id)}
              className="flex-1 bg-primary text-white hover:bg-blue-600"
              size="sm"
            >
              복용 완료
            </Button>
          )}
          <Button 
            onClick={() => onViewDetails(medication.id)}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            상세보기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
