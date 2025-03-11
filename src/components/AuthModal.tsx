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

    // Validación frontend
    const missingFields = [];
    if (isRegister && !name.trim()) missingFields.push("Nombre");
    if (!email.trim()) missingFields.push("Email");
    if (!password.trim()) missingFields.push("Contraseña");

    if (missingFields.length > 0) {
      setError(`Faltan campos requeridos: ${missingFields.join(", ")}`);
      setIsLoading(false);
      return;
    }

    try {
      if (isRegister) {
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      let errorMessage = "Error desconocido";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onPress={onOpen} variant="flat">
        Iniciar sesión
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsRegister(false)} // Resetear aquí al cerrar
        onOpenChange={onOpenChange} // Mantener el comportamiento original
      >
        <ModalContent>
          <ModalHeader>
            {isRegister ? "Regístrate" : "Iniciar sesión"}
          </ModalHeader>
          <ModalBody>
            {error && <p className="text-red-500">{error}</p>}
            {isRegister && (
              <Input
                label="Nombre"
                placeholder="Ingresa tu nombre completo"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="Ingresa tu correo electrónico"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="Ingresa tu contraseña"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </ModalBody>
          <ModalFooter>
            <Button onPress={() => setIsRegister(!isRegister)} variant="light">
              {isRegister
                ? "¿Ya tienes una cuenta? Iniciar sesión"
                : "Regístrate aquí"}
            </Button>
            <Button color="primary" onPress={handleAuth} disabled={isLoading}>
              {isLoading
                ? "Processing..."
                : isRegister
                ? "Registrarse"
                : "Iniciar sesión"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AuthModal;
