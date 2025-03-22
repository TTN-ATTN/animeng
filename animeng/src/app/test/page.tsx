import { Button } from "@/components/ui/button";

export default function Test() {
  return(
    <div>
      <h1>Eng 4 Kids</h1>
      <p>Eng 4 Kids is a web application that helps children learn English.</p>
      <Button variant="greenBtn" size="default">Home</Button><br></br>
      <Button variant="blueBtn" size="default">Lessons</Button><br></br>
      <Button variant="default" size="default">Defaut Customization</Button><br></br>
      <Button variant="redBtn" size="default">Red Button</Button><br></br>
      <Button variant="purpleBtn" size="default">
      Purple Button
      </Button><br></br>
      <Button variant="yellowBtn" size="default">
      Yellow Button
      </Button>
    </div>
  )
}
