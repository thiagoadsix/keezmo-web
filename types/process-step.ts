import { LucideProps } from "lucide-react";

export type ProcessStepStatus = 'waiting' | 'processing' | 'completed' | 'error';

export type ProcessStep = {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<LucideProps>;
  status: ProcessStepStatus;
};
