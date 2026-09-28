import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Input } from "./input"

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "password", "email", "number", "date"],
    },
  },
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: {
    placeholder: "Type something...",
    type: "text",
  },
}

export const Email: Story = {
  args: {
    placeholder: "Email address",
    type: "email",
  },
}

export const Password: Story = {
  args: {
    placeholder: "Password",
    type: "password",
  },
}

export const WithValue: Story = {
  args: {
    value: "Pre-filled value",
    readOnly: true,
  },
}

export const Disabled: Story = {
  args: {
    placeholder: "Disabled input",
    disabled: true,
  },
}
