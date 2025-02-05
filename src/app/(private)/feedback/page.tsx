"use client"

import { ImagePlus, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as React from "react"
import * as z from "zod"

import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import { Input } from "@/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Textarea } from "@/src/components/ui/textarea"

import { useToast } from "@/src/hooks/use-toast"
import { Header } from "@/src/components/header"

const MAX_FILE_SIZE = 5000000 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

const improvementSchema = z.object({
  title: z
    .string()
    .min(3, "Título deve ter no mínimo 3 caracteres")
    .max(100, "Título deve ter no máximo 100 caracteres"),
  area: z.enum(["interface", "performance", "usability", "other"], {
    required_error: "Selecione uma área",
  }),
  description: z
    .string()
    .min(10, "Descrição deve ter no mínimo 10 caracteres")
    .max(500, "Descrição deve ter no máximo 500 caracteres"),
})

const bugSchema = z.object({
  title: z
    .string()
    .min(3, "Título deve ter no mínimo 3 caracteres")
    .max(100, "Título deve ter no máximo 100 caracteres"),
  severity: z.enum(["critical", "high", "medium", "low"], {
    required_error: "Selecione a severidade",
  }),
  description: z
    .string()
    .min(10, "Descrição deve ter no mínimo 10 caracteres")
    .max(500, "Descrição deve ter no máximo 500 caracteres"),
  image: z
    .any()
    .refine((file) => !file || (file instanceof File && file.size <= MAX_FILE_SIZE), {
      message: "Imagem deve ter no máximo 5MB",
    })
    .refine((file) => !file || (file instanceof File && ACCEPTED_IMAGE_TYPES.includes(file.type)), {
      message: "Apenas imagens .jpg, .jpeg, .png e .webp são aceitas",
    })
    .optional(),
})

const featureSchema = z.object({
  title: z
    .string()
    .min(3, "Título deve ter no mínimo 3 caracteres")
    .max(100, "Título deve ter no máximo 100 caracteres"),
  description: z
    .string()
    .min(10, "Descrição deve ter no mínimo 10 caracteres")
    .max(500, "Descrição deve ter no máximo 500 caracteres"),
  benefit: z
    .string()
    .min(10, "Benefício deve ter no mínimo 10 caracteres")
    .max(500, "Benefício deve ter no máximo 500 caracteres"),
})

type ImprovementForm = z.infer<typeof improvementSchema>
type BugForm = z.infer<typeof bugSchema>
type FeatureForm = z.infer<typeof featureSchema>

export default function FeedbackPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = React.useState<"improvement" | "bug" | "feature">("improvement")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const improvementForm = useForm<ImprovementForm>({
    resolver: zodResolver(improvementSchema),
    defaultValues: {
      title: "",
      area: undefined,
      description: "",
    },
  })

  const bugForm = useForm<BugForm>({
    resolver: zodResolver(bugSchema),
    defaultValues: {
      title: "",
      severity: undefined,
      description: "",
      image: undefined,
    },
  })

  const featureForm = useForm<FeatureForm>({
    resolver: zodResolver(featureSchema),
    defaultValues: {
      title: "",
      description: "",
      benefit: "",
    },
  })

  async function onSubmitImprovement(data: ImprovementForm) {
    try {
      setIsSubmitting(true)

      const response = await fetch("/api/feedback", {
        method: "POST",
        body: JSON.stringify({
          type: "improvement",
          ...data,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: "Sua sugestão de melhoria foi enviada.",
        })
        improvementForm.reset()
      } else {
        throw new Error("Falha ao enviar feedback")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Ocorreu um erro ao enviar sua sugestão.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function onSubmitBug(data: BugForm) {
    try {
      setIsSubmitting(true)

      let base64ImageString: string | null = null
      if (data.image) {
        base64ImageString = await fileToBase64(data.image)
      }

      const response = await fetch("/api/feedback", {
        method: "POST",
        body: JSON.stringify({
          type: "bug",
          ...data,
          image: base64ImageString,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: "Seu reporte de bug foi enviado.",
        })
        bugForm.reset()
      } else {
        throw new Error("Falha ao enviar feedback")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Ocorreu um erro ao enviar seu reporte.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function onSubmitFeature(data: FeatureForm) {
    try {
      setIsSubmitting(true)

      const response = await fetch("/api/feedback", {
        method: "POST",
        body: JSON.stringify({
          type: "feature",
          ...data,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: "Sua sugestão de funcionalidade foi enviada.",
        })
        featureForm.reset()
      } else {
        throw new Error("Falha ao enviar feedback")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro!",
        description: "Ocorreu um erro ao enviar sua sugestão.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col px-8">
      <Header title="Feedback" mobileTitle="Feedback" />
      <Card>
        <CardHeader>
          <CardDescription>Compartilhe suas sugestões, reporte bugs ou sugira novas funcionalidades</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="improvement">Melhoria</TabsTrigger>
              <TabsTrigger value="bug">Bug</TabsTrigger>
              <TabsTrigger value="feature">Nova Função</TabsTrigger>
            </TabsList>

            <TabsContent value="improvement">
              <Form {...improvementForm}>
                <form onSubmit={improvementForm.handleSubmit(onSubmitImprovement)} className="space-y-4 pt-4">
                  <FormField
                    control={improvementForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título da sugestão</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite um título para sua sugestão" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={improvementForm.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a área" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-background">
                            <SelectItem value="interface">Interface</SelectItem>
                            <SelectItem value="performance">Performance</SelectItem>
                            <SelectItem value="usability">Usabilidade</SelectItem>
                            <SelectItem value="other">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={improvementForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Descreva sua sugestão de melhoria em detalhes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isSubmitting ? "Enviando..." : "Enviar feedback"}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="bug">
              <Form {...bugForm}>
                <form onSubmit={bugForm.handleSubmit(onSubmitBug)} className="space-y-4 pt-4">
                  <FormField
                    control={bugForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título do bug</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite um título descritivo para o bug" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bugForm.control}
                    name="severity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Severidade</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a severidade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-background">
                            <SelectItem value="critical">Crítico</SelectItem>
                            <SelectItem value="high">Alto</SelectItem>
                            <SelectItem value="medium">Médio</SelectItem>
                            <SelectItem value="low">Baixo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bugForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição do bug</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva o bug, como reproduzi-lo e o comportamento esperado"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={bugForm.control}
                    name="image"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel>Imagem (opcional)</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById("bug-image")?.click()}
                            >
                              <ImagePlus className="mr-2 h-4 w-4" />
                              {value ? "Trocar imagem" : "Adicionar imagem"}
                            </Button>
                            {value && <span className="text-sm text-muted-foreground">{value.name}</span>}
                            <Input
                              id="bug-image"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                onChange(file)
                              }}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isSubmitting ? "Enviando..." : "Enviar feedback"}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="feature">
              <Form {...featureForm}>
                <form onSubmit={featureForm.handleSubmit(onSubmitFeature)} className="space-y-4 pt-4">
                  <FormField
                    control={featureForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título da funcionalidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite um título para a nova funcionalidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={featureForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva a nova funcionalidade e como ela beneficiaria os usuários"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={featureForm.control}
                    name="benefit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Benefício principal</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Qual o principal benefício desta nova funcionalidade?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isSubmitting ? "Enviando..." : "Enviar feedback"}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}