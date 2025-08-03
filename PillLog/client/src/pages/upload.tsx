import { Card, CardContent } from "@/components/ui/card";
import FileUpload from "@/components/file-upload";
import { useQuery } from "@tanstack/react-query";
import { ImageUpload } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

export default function UploadPage() {
  const { data: uploads = [], isLoading } = useQuery<ImageUpload[]>({
    queryKey: ['/api/uploads'],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'processing': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '분석 완료';
      case 'processing': return '분석 중';
      case 'failed': return '분석 실패';
      default: return '대기 중';
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">처방전 업로드</h2>
        <p className="text-gray-600">약봉지나 처방전 사진을 올려주세요</p>
      </div>

      <FileUpload />

      {uploads.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">최근 업로드</h3>
          {uploads.map((upload) => (
            <Card key={upload.id} className="border border-gray-200">
              <CardContent className="p-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <i className="fas fa-image text-gray-400"></i>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{upload.fileName}</p>
                    <p className={`text-sm ${getStatusColor(upload.processingStatus)}`}>
                      {getStatusText(upload.processingStatus)}
                    </p>
                    {upload.createdAt && (
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(upload.createdAt), { 
                          addSuffix: true, 
                          locale: ko 
                        })}
                      </p>
                    )}
                  </div>
                  <i className="fas fa-chevron-right text-gray-400"></i>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-500 mt-2">업로드 기록을 불러오는 중...</p>
        </div>
      )}
    </div>
  );
}
