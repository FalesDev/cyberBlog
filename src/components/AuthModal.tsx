import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  useDisclosure,
} from "@nextui-org/react";
import { useAuth } from "../components/AuthContext";

const AuthModal = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Solo se usa en registro
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleAuth = async () => {
    setError("");
    setIsLoading(true);

    try {
      if (isRegister) {
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      console.error("Error en autenticación:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onPress={onOpen} variant="flat">
        Log In
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>{isRegister ? "Register" : "Log In"}</ModalHeader>
          <ModalBody>
            {error && <p className="text-red-500">{error}</p>}
            {isRegister && (
              <Input
                label="Name"
                placeholder="Enter your name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </ModalBody>
          <ModalFooter>
            <Button onPress={() => setIsRegister(!isRegister)} variant="light">
              {isRegister
                ? "Already have an account? Log In"
                : "Create an account"}
            </Button>
            <Button color="primary" onPress={handleAuth} disabled={isLoading}>
              {isLoading ? "Processing..." : isRegister ? "Sign Up" : "Log In"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AuthModal;
