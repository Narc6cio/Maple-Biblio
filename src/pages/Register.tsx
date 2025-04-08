import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import MainLayout from "@/components/layout/MainLayout";

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "Le prénom doit comporter au moins 2 caractères.",
  }),
  lastName: z.string().min(2, {
    message: "Le nom doit comporter au moins 2 caractères.",
  }),
  email: z.string().email({
    message: "Entrer un email valide, s'il vous plait.",
  }),
  password: z.string().min(6, {
    message: "Le mot de passe doit comporter au moins 6 caractères",
  }),
  confirmPassword: z.string().min(6, {
    message: "La confirmation du mot de passe doit comporter au moins 6 caractères",
  }),
  agreeTerms: z.boolean().refine(value => value === true, {
    message: "Vous devez accepter les conditions d'utilisation",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le mot de passe ne correspond pas",
  path: ["confirmPassword"],
});

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
  
    // Create FormData object for PHP backend
    const formData = new FormData();
    formData.append('action', 'register');
    formData.append('prenom', values.firstName);
    formData.append('nom', values.lastName);
    formData.append('email', values.email);
    formData.append('mot_de_passe', values.password);
    formData.append('confirmPassword', values.confirmPassword);
    formData.append('agreeTerms', values.agreeTerms ? '1' : '');
    
    // Use the correct URL path for WampServer
    fetch("http://localhost/bibliotheque/php/controllers/AuthController.php", {
      method: "POST",
      body: formData,
    })
    .then((response) => {
        if (!response.ok) {
          throw new Error(`Erreur du serveur: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          toast({
            title: "Inscription réussie !",
            description: data.message || "Bienvenue sur Maple Biblio !",
          });
  
          navigate('/login');
        } else {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: data.message || "Une erreur est survenue lors de l'inscription.",
          });
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Erreur:", error);
        toast({
          variant: "destructive",
          title: "Erreur réseau",
          description: "Impossible de contacter le serveur. Vérifiez que WampServer est en cours d'exécution.",
        });
        setIsLoading(false);
      });
  }

  return (
    <MainLayout>
      {/* Register Section */}
      <section className="register-section py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card shadow-lg border-0">
                <div className="card-body p-5">
                  <h2 className="text-center mb-4">Create an Account</h2>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Votre Prenom</FormLabel>
                                <FormControl>
                                  <Input placeholder="Votre Prenom" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Votre Nom</FormLabel>
                                <FormControl>
                                  <Input placeholder="Votre Nom" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mot de passe</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirmation du Mot de passe</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="agreeTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-3">
                            <FormControl>
                              <Checkbox 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                J'accepte les <a href="#" className="text-warning">Conditions d'utilisation</a> et <a href="#" className="text-warning">la politique de confidentialité</a>
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <div className="d-grid">
                        <button 
                          type="submit" 
                          className="btn btn-warning btn-lg"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Enregistrement...
                            </>
                          ) : (
                            "Enregistrement"
                          )}
                        </button>
                      </div>
                    </form>
                  </Form>
                  
                  <div className="mt-4 text-center">
                    <p>Vous avez déjà un compte ? <Link to="/login" className="text-warning">Se connecter</Link></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Register;
