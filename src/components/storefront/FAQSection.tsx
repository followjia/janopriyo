'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Do you deliver all over Bangladesh?",
    answer: "Yes, we provide nationwide home delivery through professional courier services like Steadfast, Pathao, and RedX. Delivery usually takes 2-3 days in Dhaka and 3-5 days outside Dhaka."
  },
  {
    question: "How can I track my order?",
    answer: "Once your order is shipped, you will receive a tracking link in your customer dashboard and via SMS. You can use this link to check the live status of your parcel."
  },
  {
    question: "What are your payment methods?",
    answer: "We accept Cash on Delivery (COD) as well as secure online payments including bKash, Nagad, Rocket, and all major Credit/Debit cards through SSLCommerz."
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 7-day easy return policy if the product is damaged, defective, or not as described. Please keep the original packaging and contact our support immediately."
  },
  {
    question: "Are the products genuine?",
    answer: "Absolutely. We source all our products directly from authorized distributors and manufacturers to ensure 100% authenticity for our customers."
  }
];

export function FAQSection() {
  return (
    <section className="py-24 bg-muted/20">
      <div className="container px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-6">
                <Badge variant="outline" className="px-4 py-1 border-primary/30 text-primary font-bold tracking-widest uppercase text-[10px]">
                    Information
                </Badge>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
                    Frequently Asked <br /> Questions
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                    Everything you need to know about shopping with Janopriyo Shop. Can't find the answer? Contact our support team.
                </p>
                <div className="pt-4">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border shadow-sm w-fit">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                            <HelpCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase">Need more help?</p>
                            <p className="text-sm font-black">+8801234567890</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border shadow-xl shadow-primary/5">
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="border rounded-2xl px-6 data-[state=open]:border-primary/50 transition-colors">
                            <AccordionTrigger className="text-left font-bold hover:no-underline py-6">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
      </div>
    </section>
  );
}
