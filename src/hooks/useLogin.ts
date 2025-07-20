import { useMutation } from "@tanstack/react-query"

export function useLogin() {
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        let message = 'Erro ao fazer login'
        try {
          const errorData = await response.json()
          if (errorData?.message) {
            message = errorData.message
          }
        } catch (_) {
          // Ignore JSON parse errors and use default message
        }

        throw new Error(message)
      }

      return response.json()
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token)
    },
    onError: (error) => {
      console.error(error)
    },
  })
}