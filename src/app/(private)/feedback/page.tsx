"use client";

import React, { useState, FormEvent } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/src/components/ui/select";
import { Header } from "@/src/components/header";
import { useToast } from "@/src/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function FeedbackPage() {
  const [feedbackType, setFeedbackType] = useState<"bug" | "improvement">("bug");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      type: feedbackType,
      title,
      detail,
      image,
    };

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast({
          title: "Feedback enviado!",
          description: "Obrigado por nos enviar seu feedback!",
        });

        // Resetar estado
        setFeedbackType("bug");
        setTitle("");
        setDetail("");
        setImage(null);
      } else {
        toast({
          title: "Erro ao enviar feedback",
          description: "Ocorreu um erro ao enviar seu feedback. Por favor, tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
      toast({
        title: "Erro ao enviar feedback",
        description: "Ocorreu um erro ao enviar seu feedback. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 px-8">
      <Header
        title="Feedback"
        mobileTitle="Feedback"
      />
      <Card className="bg-[#10111F] border">
        <CardHeader>
          <CardTitle className="text-xl">Envie sua opinião</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo de Feedback */}
            <div className="grid w-full max-w-sm items-center gap-2">
              <Label htmlFor="feedback-type">Tipo de Feedback</Label>
              <Select
                value={feedbackType}
                onValueChange={(val: "bug" | "improvement") =>
                  setFeedbackType(val)
                }
              >
                <SelectTrigger id="feedback-type">
                  <SelectValue placeholder="Selecione o tipo de feedback" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="improvement">Melhoria</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Título */}
            <div className="grid w-full max-w-sm items-center gap-2">
              <Label htmlFor="feedback-title">Título</Label>
              <Input
                id="feedback-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Descreva de forma resumida"
                required
              />
            </div>

            {/* Detalhes */}
            <div className="grid w-full max-w-sm items-center gap-2">
              <Label htmlFor="feedback-detail">Detalhes</Label>
              <Textarea
                id="feedback-detail"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder={feedbackType === "bug" ? "Conte-nos em detalhes sobre o bug" : "Conte-nos em detalhes sobre a melhoria"}
                required
              />
            </div>

            {/* Imagem (opcional para bug) */}
            {feedbackType === "bug" && (
              <div className="grid w-full max-w-sm items-center gap-2">
                <Label htmlFor="feedback-image">Captura de tela (opcional)</Label>
                <Input
                  id="feedback-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setImage(e.target.files[0]);
                    } else {
                      setImage(null);
                    }
                  }}
                />
              </div>
            )}

            {/* Botão de Envio */}
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Enviar'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Obrigado pelo seu feedback!
        </CardFooter>
      </Card>
    </div>
  );
}
