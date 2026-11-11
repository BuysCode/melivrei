import type { Metadata } from "next";
import localFont from "next/font/local";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import "./globals.css";

const noto = localFont({
  src: [
    { path: "../assets/NotoSans-Regular.ttf", weight: "400" },
    { path: "../assets/NotoSans-SemiBold.ttf", weight: "600" },
    { path: "../assets/NotoSans-Bold.ttf", weight: "700" },
  ],
  variable: "--font-noto",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MeLivrei — livros para continuar histórias",
    template: "%s | MeLivrei",
  },
  description:
    "Encontre, venda e troque livros usados diretamente com outros leitores.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={noto.variable}>
      <body>
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>
        <SiteHeader />
        <main id="conteudo">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
