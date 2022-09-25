import { Container, Title } from "@mantine/core";
import Organization from "../ui/organization";

function Home() {
    return (
      <Container size={'xl'} mt={'xl'}>
            <Organization />
            <Organization />
            <Organization />
            
      </Container>
    );
  }

export default Home;
