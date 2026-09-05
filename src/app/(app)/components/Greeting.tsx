"use client";
import { useEffect, useState } from "react";

export default function Greeting() {
  const [greeting, setGreeting] = useState("Bom dia");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 5) setGreeting("Boa noite");
    else if (hour >= 12) setGreeting("Boa tarde");
    else setGreeting("Bom dia");
  }, []);

  return <>{greeting}.</>;
}
