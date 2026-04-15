import { features } from "@/data/features";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function Features() {
  return (
    <section id="features" className="container mx-auto px-4 py-24 md:py-24 lg:py-32">
      <div className="mb-16 text-center">
        <h2 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl md:mb-4">
          Everything You Need
        </h2>
        <p className="mx-auto max-w-2xl text-lg font-medium text-muted-foreground md:text-xl">
          Experience a full suite of modern banking features designed with you in mind.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {features.map((feature, index) => (
          <Card key={index} className="group relative border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-card hover:shadow-xl hover:shadow-primary/5">
            <CardHeader className="p-8 md:p-8">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground md:h-12 md:w-12 md:rounded-xl md:mb-6">
                <feature.icon className="h-7 w-7 md:h-6 md:w-6" />
              </div>
              <CardTitle className="mb-4 text-2xl font-bold tracking-tight md:text-xl md:mb-3">{feature.title}</CardTitle>
              <CardDescription className="text-lg leading-relaxed text-muted-foreground md:text-base">
                {feature.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
