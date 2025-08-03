import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Medication, SymptomRecord, insertSymptomRecordSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import SymptomChart from "@/components/symptom-chart";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

const symptomFormSchema = insertSymptomRecordSchema.extend({
  symptoms: z.array(z.string()).optional(),
});

type SymptomFormData = z.infer<typeof symptomFormSchema>;

const SYMPTOM_OPTIONS = [
  "두통", "메스꺼움", "어지러움", "졸음", "식욕부진", 
  "복통", "설사", "변비", "발진", "가려움"
];

export default function SymptomsPage() {
  const [selectedMedicationId, setSelectedMedicationId] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: medications = [] } = useQuery<Medication[]>({
    queryKey: ['/api/medications'],
  });

  const { data: symptomRecords = [] } = useQuery<SymptomRecord[]>({
    queryKey: ['/api/symptoms', selectedMedicationId],
    enabled: !!selectedMedicationId,
  });

  const form = useForm<SymptomFormData>({
    resolver: zodResolver(symptomFormSchema),
    defaultValues: {
      medicationId: "",
      painLevel: 0,
      symptoms: [],
      notes: "",
    },
  });

  const createSymptomMutation = useMutation({
    mutationFn: async (data: SymptomFormData) => {
      const response = await apiRequest('POST', '/api/symptoms', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "증상 기록 완료",
        description: "증상이 성공적으로 기록되었습니다.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/symptoms'] });
    },
    onError: (error: Error) => {
      toast({
        title: "기록 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SymptomFormData) => {
    createSymptomMutation.mutate(data);
  };

  const activeMedications = medications.filter(med => med.isActive);

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">증상 기록</h2>
        <p className="text-gray-600">복용 중인 약의 효과와 부작용을 기록해보세요</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="medicationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>약물 선택</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedMedicationId(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="약물을 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activeMedications.map((medication) => (
                          <SelectItem key={medication.id} value={medication.id}>
                            {medication.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="painLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>통증 수준</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <Slider
                          min={0}
                          max={10}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>0 - 없음</span>
                          <span className="font-medium text-primary">{field.value}</span>
                          <span>10 - 매우 심함</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>증상 체크</FormLabel>
                    <div className="space-y-3">
                      {SYMPTOM_OPTIONS.map((symptom) => (
                        <div key={symptom} className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value?.includes(symptom) || false}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, symptom]);
                              } else {
                                field.onChange(current.filter(s => s !== symptom));
                              }
                            }}
                          />
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {symptom}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>추가 메모</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="증상에 대한 추가 설명을 입력해주세요..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={createSymptomMutation.isPending}
                className="w-full bg-primary hover:bg-blue-600"
              >
                {createSymptomMutation.isPending ? "기록 중..." : "증상 기록하기"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {symptomRecords.length > 0 && (
        <>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">증상 변화 추이</h3>
              <SymptomChart data={symptomRecords} />
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">최근 기록</h3>
            {symptomRecords.slice(0, 5).map((record) => {
              const medication = medications.find(m => m.id === record.medicationId);
              return (
                <Card key={record.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {medication?.name || '알 수 없는 약물'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {record.recordedAt && formatDistanceToNow(new Date(record.recordedAt), { 
                          addSuffix: true, 
                          locale: ko 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-600">
                        통증: <span className="font-medium text-primary">{record.painLevel}/10</span>
                      </span>
                      {record.symptoms && record.symptoms.length > 0 && (
                        <span className="text-gray-600">
                          증상: <span className="font-medium">{record.symptoms.join(', ')}</span>
                        </span>
                      )}
                    </div>
                    {record.notes && (
                      <p className="text-sm text-gray-600 mt-2">{record.notes}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {activeMedications.length === 0 && (
        <div className="text-center py-12">
          <i className="fas fa-pills text-4xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">복용 중인 약이 없습니다</h3>
          <p className="text-gray-600 mb-4">먼저 약물을 추가해주세요</p>
          <Button onClick={() => window.location.href = '/medications'} className="bg-primary hover:bg-blue-600">
            약물 관리하러 가기
          </Button>
        </div>
      )}
    </div>
  );
}
