"use client";

import React, { useState } from "react";
import {
  Form, 
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { init, send } from "@emailjs/browser";
import { Toaster, toast } from "react-hot-toast";

const formShema = z.object({
  name: z
    .string()
    .min(2, { message: "2자리 이상의 문자를 입력하세요." })
    .max(10, { message: "10자리 이하의 문자를 입력하세요." }),
  email: z.string().email({ message: "이메일 형식이 아닙니다." }),
  content: z.string().min(2, { message: "2자리 이상의 문자를 입력하세요." }),
});

type formType = z.infer<typeof formShema>;

const Contact = () => {
  const [isSending, setIsSending] = useState(false);

  const form = useForm<formType>({
    resolver: zodResolver(formShema),
    defaultValues: {
      name: "",
      email: "",
      content: "",
    },
  });

  /*
  const onSubmit = (data: formType) => {
    console.log(data);
    form.reset();
  };
*/

  const onSubmit: SubmitHandler<formType> = async (data: formType) => {
    const userId = process.env.NEXT_PUBLIC_EMAILJS_USER_ID;
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;

    const { name, email, content } = data;

    if (userId && serviceId && templateId) {

      setIsSending(true);
      const loadingToast = toast.loading("전송중...")
      // emailjs 초기화하기
      init(userId);

      // 전공할 데이터 정의하기
      const params = {
        name: name,
        email: email,
        content: content,
      };

      // 이메일 보내기
      try {
        await send(serviceId, templateId, params);
        toast.success("메일 전송이 성공하였습니다.");
      } catch {
        toast.success("메일 전송이 실패하였습니다.");
      } finally {
        form.reset();
        toast.dismiss(loadingToast)
        setIsSending(false);
      }
    }
  };

  return (
    <div className="container h-screen flex items-center">
      <div className="lg:w-[60%] w-full mx-auto">
        <h2 className="text-[40px] font-bold mb-[30px]">문의하기</h2>
        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이름</FormLabel>
                  <FormControl>
                    <Input placeholder="이름" {...field} />
                  </FormControl>
                  <FormDescription>이름을 입력하세요</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일주소</FormLabel>
                  <FormControl>
                    <Input placeholder="exam@exam.com" {...field} />
                  </FormControl>
                  <FormDescription>이메일주소를 입력하세요.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>문의내용</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Next.js관련 문의를 해주세요."
                      {...field}
                      className="resize-none h-[200px]"
                    />
                  </FormControl>
                  <FormDescription>문의내용을 입력해 주세요.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isSending}>보내기</Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Contact;
