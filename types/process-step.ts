export type ProcessStepStatus = 'waiting' | 'processing' | 'completed' | 'error';

export type ProcessStep = {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: ProcessStepStatus;
};
