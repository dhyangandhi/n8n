import React from "react";
import { Button } from "@/components/ui/button";
const Page = () => {

 const something = true;

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center">
      <Button variant={"outline"}>
        Click Me
      </Button>
    </div>
  )
}

export default Page;