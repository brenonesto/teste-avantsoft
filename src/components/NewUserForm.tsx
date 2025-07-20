import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { ptBR } from "date-fns/locale"
import { faker } from "@faker-js/faker"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface NewUserFormProps {
  handleAddCliente: (cliente: any) => void
  isLoading: boolean
}

const formSchema = z.object({
  nome: z.string().min(1),
  email: z.email(),
  nascimento: z.date(),
})

export function NewUserForm({ handleAddCliente, isLoading }: NewUserFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      email: "",
      nascimento: new Date(),
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    const numeroDeVendas = faker.number.int({ min: 1, max: 15 });
    const vendas = [];
    
    for (let i = 0; i < numeroDeVendas; i++) {
      vendas.push({
        data: faker.date.recent({ days: 4 }).toISOString().split('T')[0],
        valor: faker.number.int({ min: 1, max: 200 }),
      });
    }
    const newCliente = {
      info: {
        nomeCompleto: data.nome,
        detalhes: {
          email: data.email,
          nascimento: data.nascimento.toISOString().split('T')[0],
        }
      },
      estatisticas: {
        vendas,
      }
    }
    handleAddCliente(newCliente)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField control={form.control} name="nome" render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl>
              <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
        />
        <FormField control={form.control} name="nascimento" render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Data de nascimento</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] pl-3 text-left font-normal",
                    )}
                  >
                    {format(field.value, "PPP", { locale: ptBR })}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  locale={ptBR}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
        />
        <Button type="submit" disabled={isLoading} >
          {isLoading ? <Loader2 className="animate-spin" /> : 'Salvar'}
        </Button>
      </form>
    </Form> 
  )
}