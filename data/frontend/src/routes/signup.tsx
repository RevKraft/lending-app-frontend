import {
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  Icon,
  Image,
  Input,
  FormLabel,
} from "@chakra-ui/react"
import {
  createFileRoute,
  redirect,
} from "@tanstack/react-router"
import { FaPlus } from "react-icons/fa"
import { type SubmitHandler, useForm } from "react-hook-form"
import Logo from "/assets/images/fastapi-logo.svg"
import { isLoggedIn } from "../hooks/useAuth"
import { emailPattern } from "../utils"
import { type UserRegister, UsersService } from "../client"
import type { ApiError } from "../client/core/ApiError"
import useCustomToast from "../hooks/useCustomToast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
//import { useNavigate } from "react-router-dom"


interface UserRegisterForm extends UserRegister {
  confirm_password: string
}

export const Route = createFileRoute("/signup")({
  component: Signup,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
})

function Signup() {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<UserRegisterForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      email: "",
      full_name: "",
      password: "",
      confirm_password: "",
    },
  })

  
  const mutation = useMutation({
    mutationFn: (data: UserRegister) =>
      UsersService.registerUser({ requestBody: data }),
    onSuccess: () => {
      //const navigate = useNavigate()
      showToast("Success!", "User created successfully.", "success")
      reset()
      //navigate("/login")
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail
      showToast("Something went wrong.", `${errDetail}`, "error")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })


  const onSubmit: SubmitHandler<UserRegisterForm> = (data) => {
    mutation.mutate(data)
  }


  return (
    <>
      <Container
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        h="100vh"
        maxW="sm"
        alignItems="stretch"
        justifyContent="center"
        gap={4}
        centerContent
      >
        <Image
          src={Logo}
          alt="FastAPI logo"
          height="auto"
          maxW="2xs"
          alignSelf="center"
          mb={4}
        />
        <FormControl isRequired isInvalid={!!errors.email}>
          <FormLabel htmlFor="email">Email</FormLabel>
          <Input
            id="email"
            {...register("email", {
              required: "Email is required",
              pattern: emailPattern,
            })}
            placeholder="Email"
            type="email"
          />
          {errors.email && (
            <FormErrorMessage>{errors.email.message}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl mt={4} isInvalid={!!errors.full_name}>
          <FormLabel htmlFor="name">Full name</FormLabel>
          <Input
            id="name"
            {...register("full_name")}
            placeholder="Full name"
            type="text"
          />
          {errors.full_name && (
            <FormErrorMessage>{errors.full_name.message}</FormErrorMessage>
          )}
        </FormControl>
        <FormControl mt={4} isRequired isInvalid={!!errors.password}>
              <FormLabel htmlFor="password">Set Password</FormLabel>
              <Input
                id="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                placeholder="Password"
                type="password"
              />
              {errors.password && (
                <FormErrorMessage>{errors.password.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl
              mt={4}
              isRequired
              isInvalid={!!errors.confirm_password}
            >
              <FormLabel htmlFor="confirm_password">Confirm Password</FormLabel>
              <Input
                id="confirm_password"
                {...register("confirm_password", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === getValues().password ||
                    "The passwords do not match",
                })}
                placeholder="Password"
                type="password"
              />
              {errors.confirm_password && (
                <FormErrorMessage>
                  {errors.confirm_password.message}
                </FormErrorMessage>
              )}
            </FormControl>
        <Button variant="primary" type="submit" isLoading={isSubmitting} gap={1}
          fontSize={{ base: "sm", md: "inherit" }}>
          <Icon as={FaPlus} /> Add {"User"}
        </Button>
      </Container>
    </>
  )
}
