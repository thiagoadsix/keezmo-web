
import * as SignUp from '@clerk/elements/sign-up';

export default function SignUpPage() {
  return (
    <SignUp.Root>
      <SignUp.Step name="start">
        <h1>Sign up to your account</h1>
      </SignUp.Step>
    </SignUp.Root>
  );
}
